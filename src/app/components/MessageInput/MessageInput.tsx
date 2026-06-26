"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/Button/Button";
// import { Button } from "@/components/ui/Button";

interface MessageInputProps {
  channelId: string;
  onMessageSent: () => void;
}

export function MessageInput({ channelId, onMessageSent }: MessageInputProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (res.ok) {
        setMessage("");
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Get upload signature from server
      const signatureRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "slack-clone" }),
      });
      const { signature, timestamp, cloudname, apiKey } = await signatureRes.json();

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "slack-clone");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudname}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await uploadRes.json();

      // Send message with file URL
      const messageRes = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📎 ${file.name}`,
          fileUrl: data.secure_url,
        }),
      });

      if (messageRes.ok) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message #${channelId}`}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-gray-500 hover:text-gray-700"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </Button>
        
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}