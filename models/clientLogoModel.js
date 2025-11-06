import mongoose from "mongoose";

const clientLogoSchema = new mongoose.Schema({
  img: { 
    type: String,
    required: true, 
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ClientLogo", clientLogoSchema);
