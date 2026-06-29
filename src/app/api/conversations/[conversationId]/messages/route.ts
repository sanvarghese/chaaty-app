import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  await dbConnect();
  const messages = await Message.find({ conversationId })
    .populate("user", "name image")
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const body = await req.json();
  await dbConnect();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const user = await User.findOne({ email: session.user.email });
  const isParticipant = conversation.participants.some((id: any) => id.toString() === user?._id.toString());
  if (!user || !isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await Message.create({
    content: body.content,
    conversationId,
    user: user._id,
    fileUrl: body.fileUrl || null,
  });

  const populated = await message.populate("user", "name image");
  return NextResponse.json(populated, { status: 201 });
}  