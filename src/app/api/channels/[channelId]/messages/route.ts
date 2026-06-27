import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Message from "@/models/Message";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channelId } = await params;
    await dbConnect();
    const messages = await Message.find({ channelId: decodeURIComponent(channelId) })
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const message = await Message.create({
    content: body.content,
    channelId: params.channelId,
    user: user._id,
    fileUrl: body.fileUrl || null,
  });

  const populatedMessage = await message.populate("user", "name image");
  return NextResponse.json(populatedMessage, { status: 201 });
}