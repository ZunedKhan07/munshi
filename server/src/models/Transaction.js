import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    type: { type: String, enum: ["udhaar", "payment"], required: true },
    amount: { type: Number, required: true, min: 0.01, max: 1000000 },
    note: { type: String, default: "", maxlength: 240 },
    undone: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Transaction", schema);
