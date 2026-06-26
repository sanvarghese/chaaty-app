"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/Button/Button";
// import { Button } from "@/components/ui/Button";

interface Channel {
  _id: string;
  name: string;
  description?: string;
}

export function ChannelList() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/channels");
      const data = await res.json();
      setChannels(data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannelName }),
      });
      if (res.ok) {
        setNewChannelName("");
        setShowModal(false);
        fetchChannels();
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="w-60 bg-[#F8F9FA] border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Channels</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {channels.map((channel) => (
          <div
            key={channel._id}
            className="px-3 py-2 rounded cursor-pointer hover:bg-gray-200 transition"
          >
            # {channel.name}
          </div>
        ))}
      </div>

      {/* Create Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create a Channel</h3>
            <form onSubmit={createChannel}>
              <input
                type="text"
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                required
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}