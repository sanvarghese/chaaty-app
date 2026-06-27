import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const q = new URL(req.url).searchParams.get("q") || "";
  const users = await User.find({
    email: { $ne: session.user.email },
    ...(q ? { name: { $regex: q, $options: "i" } } : {}),
  }).select("name email image").limit(20);

  return NextResponse.json(users);
}