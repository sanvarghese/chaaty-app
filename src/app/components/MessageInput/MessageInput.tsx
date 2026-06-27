"use client";

import { useState } from "react";

interface MessageInputProps {
  channelId: string;
  mode?: "channel" | "dm";
  onMessageSent: () => void;
  placeholderLabel?: string;
}

export function MessageInput({ channelId, mode = "channel", onMessageSent, placeholderLabel }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const basePath = mode === "dm" ? "/api/conversations" : "/api/channels";

  const send = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setContent("");
    try {
      const res = await fetch(`${basePath}/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) onMessageSent();
      else console.error("Failed to send message:", res.status, await res.text());
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-gray-400 transition">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={`Message ${placeholderLabel || channelId}`}
          className="flex-1 text-sm outline-none"
        />
        <button
          onClick={send}
          disabled={!content.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-1.5 rounded-md transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}