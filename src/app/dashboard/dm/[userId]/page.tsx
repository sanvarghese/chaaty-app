"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatArea } from "@/app/components/ChatArea/ChatArea";

export default function DirectMessagePage() {
  const params = useParams<{ userId: string }>();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [person, setPerson] = useState<{ name: string; image?: string } | null>(null);

  useEffect(() => {
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: params.userId }),
    })
      .then((res) => res.json())
      .then((conversation) => setConversationId(conversation._id));

    fetch(`/api/users/${params.userId}`).then((r) => r.json()).then(setPerson);
  }, [params.userId]);

  if (!conversationId) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Loading conversation...</div>;
  }

  return <ChatArea channelId={conversationId} mode="dm" title={person?.name} avatar={person?.image} />;
}