import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest, { params }: { params: { channelId: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const messages = await Message.find({ channelId: params.channelId })
    .populate('user', 'name image')
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json(messages);
}