"use client";

import { useState, useEffect } from "react";

interface SimpleUser { _id: string; name: string; email: string; image?: string }

export function AddMembersModal({ channelId, onClose }: { channelId: string; onClose: () => void }) {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [members, setMembers] = useState<SimpleUser[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/channels/${channelId}/members`).then((r) => r.json()).then(setMembers);
  }, [channelId]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/users?q=${encodeURIComponent(query)}`).then((r) => r.json()).then(setUsers);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const addMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/channels/${channelId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        console.error("Failed to add member:", res.status, await res.text());
        return;
      }
      setMembers(await res.json());
    } catch (err) {
      console.error("Network error adding member:", err);
    }
  };

  const isMember = (id: string) => members.some((m) => m._id === id);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add people to #{channelId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <input
          type="text"
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <img src={user.image || "/default-avatar.png"} className="w-8 h-8 rounded-full" alt={user.name} />
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>
              <button
                disabled={isMember(user._id)}
                onClick={() => addMember(user._id)}
                className="text-sm px-3 py-1 rounded border disabled:text-gray-400"
              >
                {isMember(user._id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}