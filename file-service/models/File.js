import mongoose from "mongoose";

const sharedSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    permission: { type: String, enum: ["read", "edit"], required: true },
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true }, // who uploaded (userId)
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    sharedWith: { type: [sharedSchema], default: [] }, // array of {userId, permission}
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
