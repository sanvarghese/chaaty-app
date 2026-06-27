import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const me = await User.findOne({ email: session.user.email });
  const conversations = await Conversation.find({ participants: me!._id })
    .populate("participants", "name email image")
    .sort({ updatedAt: -1 });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  await dbConnect();
  const me = await User.findOne({ email: session.user.email });

  let conversation = await Conversation.findOne({
    participants: { $all: [me!._id, userId], $size: 2 },
  });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [me!._id, userId] });
  }

  const populated = await Conversation.findById(conversation._id).populate("participants", "name email image");
  return NextResponse.json(populated, { status: 201 });
}