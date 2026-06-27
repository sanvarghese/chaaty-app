import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Channel from "@/models/Channel";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import ReadState from "@/models/ReadState";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [channels, conversations, readStates] = await Promise.all([
      Channel.find({}),
      Conversation.find({ participants: me._id }),
      ReadState.find({ user: me._id }),
    ]);

    const lastReadByChannel = new Map<string, Date>();
    const lastReadByConversation = new Map<string, Date>();
    readStates.forEach((rs: any) => {
      if (rs.channelId) lastReadByChannel.set(rs.channelId, rs.lastReadAt);
      if (rs.conversationId) lastReadByConversation.set(rs.conversationId.toString(), rs.lastReadAt);
    });

    const channelCounts: Record<string, number> = {};
    await Promise.all(
      channels.map(async (c: any) => {
        const since = lastReadByChannel.get(c.name) || new Date(0);
        channelCounts[c.name] = await Message.countDocuments({
          channelId: c.name,
          user: { $ne: me._id },
          createdAt: { $gt: since },
        });
      })
    );

    // Keyed by the OTHER person's userId, so the sidebar can look it up directly
    const dmCounts: Record<string, number> = {};
    await Promise.all(
      conversations.map(async (c: any) => {
        const since = lastReadByConversation.get(c._id.toString()) || new Date(0);
        const count = await Message.countDocuments({
          conversationId: c._id,
          user: { $ne: me._id },
          createdAt: { $gt: since },
        });
        const otherId = c.participants.find((p: any) => p.toString() !== me._id.toString());
        if (otherId) dmCounts[otherId.toString()] = count;
      })
    );

    return NextResponse.json({ channels: channelCounts, dms: dmCounts });
  } catch (err) {
    console.error("Error fetching unread counts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}