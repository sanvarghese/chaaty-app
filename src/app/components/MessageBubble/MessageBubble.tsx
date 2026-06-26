"use client";

import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: {
    _id: string;
    content: string;
    user: {
      name: string;
      image: string;
    };
    createdAt: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = false; // Add logic to check if message is from current user

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <img
        src={message.user.image || "/default-avatar.png"}
        alt={message.user.name}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{message.user.name}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className={`p-3 rounded-lg max-w-2xl ${
          isOwn 
            ? "bg-blue-500 text-white" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}