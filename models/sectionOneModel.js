// models/sectionOneModel.js
import mongoose from "mongoose";
mongoose.set("debug", true);

const sectionOneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  img: { 
    type: String,
    validate: {
      validator: (v) => !v || v.replace(/\\/g, '/').startsWith('section-one/'),
      message: "Image path must be within the 'section-one' directory.",
    },
  },
});

export default mongoose.model("SectionOne", sectionOneSchema);
