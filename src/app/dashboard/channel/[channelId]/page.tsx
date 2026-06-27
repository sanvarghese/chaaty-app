import { ChatArea } from "@/app/components/ChatArea/ChatArea";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  return <ChatArea channelId={decodeURIComponent(channelId)} />;
}