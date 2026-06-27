import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Channel from "@/models/Channel";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = await params;
  await dbConnect();
  const channel = await Channel.findOne({ name: channelId }).populate("members", "name email image");
  return NextResponse.json(channel?.members || []);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const { channelId } = await params;
      const { userId } = await req.json();
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  
      await dbConnect();
      let channel = await Channel.findOne({ name: channelId });
      if (!channel) channel = await Channel.create({ name: channelId, members: [] });
  
      if (!channel.members.some((id: any) => id.toString() === userId)) {
        channel.members.push(userId);
        await channel.save();
      }
  
      const updated = await Channel.findById(channel._id).populate("members", "name email image");
      return NextResponse.json(updated!.members);
    } catch (err) {
      console.error("Error adding channel member:", err);
      return NextResponse.json({ error: "Server error", details: (err as Error).message }, { status: 500 });
    }
  }