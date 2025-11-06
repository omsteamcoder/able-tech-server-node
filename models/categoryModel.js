import mongoose from 'mongoose';

const { Schema } = mongoose;

// Category Schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Slug for SEO-friendly URLs
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

export default Category;
