"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import { ChannelList } from "../components/ChannelList/ChannelList";
import { ChatArea } from "../components/ChatArea/ChatArea";
// import { Sidebar } from "@/components/Sidebar";
// import { ChannelList } from "@/components/ChannelList";
// import { ChatArea } from "@/components/ChatArea";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1">
        <ChannelList />
        <ChatArea />
      </div>
    </div>
  );
}