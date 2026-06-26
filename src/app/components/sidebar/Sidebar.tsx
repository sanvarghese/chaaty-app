"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/Button/Button";

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-[#3F0E40] text-white flex flex-col">
      <div className="p-4 border-b border-[#522653]">
        <h2 className="text-lg font-bold">Chatti</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Channels
          </div>
          <Link
            href="/dashboard/channel/general"
            className="block px-2 py-1 rounded hover:bg-[#522653] transition"
          >
            # general
          </Link>
          <Link
            href="/dashboard/channel/random"
            className="block px-2 py-1 rounded hover:bg-[#522653] transition"
          >
            # random
          </Link>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Direct Messages
          </div>
          <div className="px-2 py-1 rounded hover:bg-[#522653] transition cursor-pointer">
            @ {session?.user?.name?.split(" ")[0] || "User"}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#522653]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={session?.user?.image || "/default-avatar.png"}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="text-sm">
              <div className="font-semibold">{session?.user?.name}</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-gray-400 hover:text-white hover:bg-[#522653]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}