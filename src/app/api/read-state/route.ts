import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import ReadState from "@/models/ReadState";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channelId, conversationId } = await req.json();
    await dbConnect();
    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const filter = channelId ? { user: me._id, channelId } : { user: me._id, conversationId };
    await ReadState.findOneAndUpdate(filter, { ...filter, lastReadAt: new Date() }, { upsert: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error updating read state:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}