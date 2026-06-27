"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button/Button";

interface ChannelItem { _id: string; name: string }
interface PersonItem { _id: string; name: string; image?: string }
interface UnreadData { channels: Record<string, number>; dms: Record<string, number> }

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-white text-[#3F0E40] text-[10px] font-bold leading-none rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [unread, setUnread] = useState<UnreadData>({ channels: {}, dms: {} });
  const [creating, setCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/channels").then((r) => r.json()).then(setChannels);
    fetch("/api/users").then((r) => r.json()).then(setPeople);
  }, []);

  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/read-state/unread")
        .then((r) => r.json())
        .then((data) => { if (data?.channels && data?.dms) setUnread(data); })
        .catch((e) => console.error(e));
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 5000);
    return () => clearInterval(id);
  }, []);

  const createChannel = async () => {
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const channel = await res.json();
      setChannels((prev) => [...prev, channel]);
      setNewChannelName("");
      setCreating(false);
      router.push(`/dashboard/channel/${channel.name}`);
    }
  };

  const isActive = (href: string) => pathname === href;

  const filteredChannels = useMemo(
    () => channels.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [channels, query]
  );
  const filteredPeople = useMemo(
    () => people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [people, query]
  );

  return (
    <div className="w-64 bg-[#3F0E40] text-white flex flex-col shrink-0">
      <div className="px-4 pt-3 pb-2 border-b border-[#522653]">
        <button className="flex items-center justify-between w-full group" title="Workspace menu">
          <span className="text-lg font-bold tracking-tight truncate">Chatti</span>
          <svg className="w-4 h-4 text-purple-200/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-[#2C0A2E] rounded-md px-2.5 py-1.5">
          <svg className="w-4 h-4 text-purple-300/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a conversation..."
            className="bg-transparent text-sm outline-none placeholder:text-purple-300/50 w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-purple-200/70 uppercase tracking-wider">Channels</span>
            <button onClick={() => setCreating((c) => !c)} className="text-purple-200/70 hover:text-white text-base leading-none" aria-label="Add channel">
              +
            </button>
          </div>

          {creating && (
            <div className="px-2 mb-2">
              <input
                autoFocus
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createChannel()}
                placeholder="channel-name"
                className="w-full bg-[#2C0A2E] text-sm rounded px-2 py-1 outline-none placeholder:text-purple-300/50"
              />
            </div>
          )}

          <div className="space-y-0.5">
            {filteredChannels.map((channel) => {
              const href = `/dashboard/channel/${channel.name}`;
              const active = isActive(href);
              const count = active ? 0 : unread.channels[channel.name] || 0;
              return (
                <Link key={channel._id} href={href} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded text-sm transition ${active ? "bg-white/15 font-semibold text-white" : "text-purple-100/85 hover:bg-[#522653]"}`}>
                  <span className="flex items-center gap-2 truncate">
                    <span className="opacity-60">#</span>
                    <span className={count > 0 ? "font-semibold text-white" : ""}>{channel.name}</span>
                  </span>
                  <UnreadBadge count={count} />
                </Link>
              );
            })}
            {filteredChannels.length === 0 && <div className="px-2 text-xs text-purple-300/50">No channels found</div>}
          </div>
        </div>

        <div>
          <div className="px-2 mb-1 text-xs font-semibold text-purple-200/70 uppercase tracking-wider">Direct Messages</div>
          <div className="space-y-0.5">
            {filteredPeople.map((person) => {
              const href = `/dashboard/dm/${person._id}`;
              const active = isActive(href);
              const count = active ? 0 : unread.dms[person._id] || 0;
              return (
                <Link key={person._id} href={href} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded text-sm transition ${active ? "bg-white/15 font-semibold text-white" : "text-purple-100/85 hover:bg-[#522653]"}`}>
                  <span className="flex items-center gap-2 truncate">
                    <span className="relative shrink-0">
                      <img src={person.image || "/default-avatar.png"} alt={person.name} className="w-5 h-5 rounded-sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 ring-1 ring-[#3F0E40]" />
                    </span>
                    <span className={`truncate ${count > 0 ? "font-semibold text-white" : ""}`}>{person.name}</span>
                  </span>
                  <UnreadBadge count={count} />
                </Link>
              );
            })}
            {filteredPeople.length === 0 && <div className="px-2 text-xs text-purple-300/50">No people found</div>}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#522653]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={session?.user?.image || "/default-avatar.png"} alt="Avatar" className="w-8 h-8 rounded-md shrink-0" />
            <div className="text-sm min-w-0">
              <div className="font-semibold truncate">{session?.user?.name}</div>
              <div className="text-xs text-purple-200/70">Online</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-purple-200/70 hover:text-white hover:bg-[#522653] shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}