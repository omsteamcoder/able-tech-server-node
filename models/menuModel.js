import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true }, // Added link field as required
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", default: null }, // null for level 0 items
  level: { type: Number, default: 0 }, // For hierarchy level tracking
  order: { type: Number, default: 0 }, // For ordering within each level
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
