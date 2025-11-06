import mongoose from 'mongoose';
const { Schema } = mongoose;

const subcategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true } // Link to parent Category
}, {
  timestamps: true
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
