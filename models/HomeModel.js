import mongoose from 'mongoose';

const { Schema } = mongoose;

// Banner Section Schema
const bannerSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  buttonText: { type: String, required: true },
  buttonLink: { type: String, required: true },
});

// Product Section Schema
const productSectionSchema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
});

// Single Section Schema
const singleSectionSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

// Feedback Section Schema
const feedbackSchema = new Schema({
  name: { type: String, required: true },
  comment: { type: String, required: true },
  image: { type: String, required: true },
});

// Admin Product Highlight Section Schema
const adminProductHighlightSchema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
});

// Create models for each schema
const Banner = mongoose.model('Banner', bannerSchema);
const ProductSection = mongoose.model('ProductSection', productSectionSchema);
const SingleSection = mongoose.model('SingleSection', singleSectionSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const AdminProductHighlight = mongoose.model('AdminProductHighlight', adminProductHighlightSchema);

export { Banner, ProductSection, SingleSection, Feedback, AdminProductHighlight };
