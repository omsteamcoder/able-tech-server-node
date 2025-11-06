import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: { type: String, required: true },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 60,
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  keywords: {
    type: [String],
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  published: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
  },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

blogSchema.virtual("url").get(function () {
  return `/blog/${this.slug}`;
});

export default mongoose.model("Blog", blogSchema);
