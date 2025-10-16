import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // this gives you createdAt & updatedAt
);

export default mongoose.model("Chat", chatSchema);
