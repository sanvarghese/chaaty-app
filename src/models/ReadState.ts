import mongoose from "mongoose";

const ReadStateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channelId: { type: String, default: null },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
  lastReadAt: { type: Date, default: Date.now },
});

export default mongoose.models.ReadState || mongoose.model("ReadState", ReadStateSchema);