interface MessageBubbleProps {
  message: { _id: string; content: string; user: { _id: string; name: string; image: string }; createdAt: string };
  compact?: boolean;
}

export function MessageBubble({ message, compact = false }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (compact) {
    return (
      <div className="flex gap-3 px-2 py-0.5 rounded-lg hover:bg-gray-50 group">
        <div className="w-9 shrink-0 flex items-start justify-center">
          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition mt-1">{time}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed max-w-2xl" style={{ color: "#1f2937" }}>
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-2 py-1 rounded-lg hover:bg-gray-50 group">
      <img
        src={message.user?.image || "/default-avatar.png"}
        alt={message.user?.name}
        className="w-9 h-9 rounded-md shrink-0 mt-0.5 object-cover"
      />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-gray-900">{message.user?.name || "Unknown"}</span>
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">{time}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed max-w-2xl" style={{ color: "#1f2937" }}>
          {message.content}
        </p>
      </div>
    </div>
  );
}