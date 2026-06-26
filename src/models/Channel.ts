import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);