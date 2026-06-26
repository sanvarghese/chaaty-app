import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Channel from "@/models/Channel";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const channels = await Channel.find({});
  return NextResponse.json(channels);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await dbConnect();

  const channel = await Channel.create({
    name: body.name,
    description: body.description || "",
  });

  return NextResponse.json(channel, { status: 201 });
}