import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  buttonText: {
    type: String,
  },
  buttonLink: {
    type: String,
  },
  img: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Slider", sliderSchema);
