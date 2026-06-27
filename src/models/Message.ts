import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  channelId: { type: String }, // for channel messages
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }, // for DMs
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);