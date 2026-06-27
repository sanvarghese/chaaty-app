"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { MessageInput } from "../MessageInput/MessageInput";
import { AddMembersModal } from "../AddMemberModal/AddMembersModal";

interface Message { _id: string; content: string; user: { _id: string; name: string; image: string }; createdAt: string }
interface ChatAreaProps { channelId: string; mode?: "channel" | "dm"; title?: string; avatar?: string }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export function ChatArea({ channelId, mode = "channel", title, avatar }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const basePath = mode === "dm" ? "/api/conversations" : "/api/channels";

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useEffect(() => {
    fetch("/api/read-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "dm" ? { conversationId: channelId } : { channelId }),
    }).catch((e) => console.error("Failed to mark as read:", e));
  }, [channelId, mode]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${basePath}/${channelId}/messages`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const ordered = messages.slice().reverse();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-5 pt-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 min-w-0">
            {mode === "dm" && <img src={avatar || "/default-avatar.png"} alt={title} className="w-6 h-6 rounded-md shrink-0" />}
            <h2 className="font-bold text-gray-900 truncate">
              {mode === "channel" ? `# ${channelId}` : title || "Direct Message"}
            </h2>
          </div>
          {mode === "channel" && (
            <button
              onClick={() => setShowAddMembers(true)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition shrink-0"
            >
              + Add people
            </button>
          )}
        </div>
        <div className="flex gap-5 text-sm">
          <span className="pb-2 -mb-px border-b-2 border-gray-900 font-semibold text-gray-900">Messages</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 bg-white">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading messages…</div>
        ) : ordered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-1">
            <div className="text-2xl mb-1">{mode === "channel" ? "👋" : "💬"}</div>
            <div className="font-semibold text-gray-700">
              {mode === "channel" ? `This is the start of #${channelId}` : "Start the conversation"}
            </div>
            <div className="text-sm text-gray-400">Send the first message below.</div>
          </div>
        ) : (
          ordered.map((m, i) => {
            const msgDate = new Date(m.createdAt);
            const prevDate = i > 0 ? new Date(ordered[i - 1].createdAt) : null;
            const showDivider = !prevDate || !isSameDay(msgDate, prevDate);
            return (
              <div key={m._id}>
                {showDivider && (
                  <div className="flex items-center justify-center my-3">
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200">
                      {formatDayLabel(msgDate)}
                    </span>
                  </div>
                )}
                <MessageBubble message={m} />
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <MessageInput
        channelId={channelId}
        mode={mode}
        onMessageSent={fetchMessages}
        placeholderLabel={mode === "channel" ? `#${channelId}` : title || "this conversation"}
      />

      {showAddMembers && mode === "channel" && (
        <AddMembersModal channelId={channelId} onClose={() => setShowAddMembers(false)} />
      )}
    </div>
  );
}