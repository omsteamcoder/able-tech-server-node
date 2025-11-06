// models/PageModel.js
import mongoose from "mongoose";

/**
 * @typedef {Object} BlockStyleSettings
 * @property {string} backgroundColor - Background color
 * @property {string} textColor - Text color
 * @property {string} fontFamily - Font family
 * @property {string} fontSize - Font size
 * @property {string} padding - CSS padding
 * @property {string} margin - CSS margin
 * @property {string} customCSS - Custom CSS
 */

/**
 * @typedef {Object} LayoutBlock
 * @property {string} id - Unique block identifier
 * @property {string} type - Block type (hero, text, features, testimonials, gallery, cta, contact)
 * @property {number} order - Display order
 * @property {BlockStyleSettings} styles - Block-specific styles
 * @property {Object} data - Block content data (type-specific)
 */

/**
 * @typedef {Object} PageLayout
 * @property {string} backgroundColor - Page background color
 * @property {string} textColor - Default text color
 * @property {string} fontFamily - Default font family
 * @property {string} fontSize - Default font size
 * @property {string} containerWidth - Max container width
 * @property {string} containerPadding - Container padding
 * @property {string} customCSS - Global custom CSS
 */

/**
 * @typedef {Object} PageMeta
 * @property {string} title - SEO title
 * @property {string} description - SEO description
 * @property {string[]} keywords - SEO keywords
 * @property {string} canonicalUrl - Canonical URL
 * @property {Object} openGraph - Open Graph data
 */

const BlockStyleSettingsSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String, default: "transparent" },
    textColor: { type: String, default: "#000000" },
    fontFamily: { type: String, default: "Inter, sans-serif" },
    fontSize: { type: String, default: "16px" },
    padding: { type: String, default: "20px" },
    margin: { type: String, default: "0px" },
    customCSS: { type: String, default: "" },
  },
  { _id: false }
);

const LayoutBlockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () =>
        `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "hero",
        "text",
        "features",
        "testimonials",
        "gallery",
        "cta",
        "contact",
        "pricing",
        "team",
        "faq",
        "table",
      ],
    },
    order: {
      type: Number,
      default: 0,
    },
    styles: {
      type: BlockStyleSettingsSchema,
      default: () => ({}),
    },
    // Flexible data structure for different block types
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { _id: false }
);
const PageLayoutSchema = new mongoose.Schema(
  {
    backgroundColor: {
      type: String,
      default: "#ffffff",
      validate: {
        validator: function (v) {
          return (
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || v === "transparent"
          );
        },
        message: 'Background color must be a valid hex color or "transparent"',
      },
    },
    textColor: {
      type: String,
      default: "#000000",
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Text color must be a valid hex color",
      },
    },
    fontFamily: {
      type: String,
      default: "Inter, sans-serif",
    },
    fontSize: {
      type: String,
      default: "16px",
      validate: {
        validator: function (v) {
          return /^\d+(px|rem|em|%)$/.test(v);
        },
        message: "Font size must be a valid CSS size (e.g., 16px, 1rem)",
      },
    },
    containerWidth: {
      type: String,
      default: "1200px",
      validate: {
        validator: function (v) {
          return /^\d+(px|%|vw)$/.test(v) || v === "100%";
        },
        message: "Container width must be a valid CSS width",
      },
    },
    containerPadding: {
      type: String,
      default: "20px",
      validate: {
        validator: function (v) {
          return /^\d+(px|rem|em)$/.test(v);
        },
        message: "Container padding must be a valid CSS size",
      },
    },
    customCSS: { type: String, default: "" },
  },
  { _id: false }
);

const PageMetaSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: [{ type: String }],
    canonicalUrl: { type: String, default: "" },
    openGraph: {
      title: String,
      description: String,
      image: String,
      url: String,
    },
  },
  { _id: false }
);

const PageSchema = new mongoose.Schema(
  {
    // Core content
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Media
    thumbnail: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
        default: [],
      },
    ],
    backgroundImage: {
      type: String,
      default: "",
    },
    sectionBackgroundImages: [
      {
        type: String,
        default: [],
      },
    ],

    // Rich content (BlockNote JSON)
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Modular layout
    layout: {
      type: PageLayoutSchema,
      default: () => ({}),
    },

    // SEO & metadata
    meta: {
      type: PageMetaSchema,
      default: () => ({}),
    },

    // Modular blocks for page composition
    blocks: [LayoutBlockSchema],

    // Organization
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    category: {
      type: String,
      default: "general",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Analytics & management
    viewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
PageSchema.index({ slug: 1 });
PageSchema.index({ status: 1 });
PageSchema.index({ category: 1 });
PageSchema.index({ "blocks.type": 1 });
PageSchema.index({ createdAt: -1 });

// Static method for slug generation
PageSchema.statics.generateSlug = async function (title) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let uniqueSlug = slug;
  let counter = 1;
  let existingPage = await this.findOne({ slug: uniqueSlug });

  while (existingPage) {
    uniqueSlug = `${slug}-${counter}`;
    existingPage = await this.findOne({ slug: uniqueSlug });
    counter++;
  }

  return uniqueSlug;
};

// Instance method to increment views
PageSchema.methods.incrementViews = function () {
  this.viewCount += 1;
  return this.save();
};

// Add pre-save middleware to ensure meta defaults
PageSchema.pre("save", function (next) {
  // Ensure meta title defaults to page title if not set
  if (!this.meta.title) {
    this.meta.title = this.title;
  }

  // Ensure OG title defaults to meta title if not set
  if (!this.meta.openGraph?.title && this.meta.title) {
    if (!this.meta.openGraph) this.meta.openGraph = {};
    this.meta.openGraph.title = this.meta.title;
  }

  // Ensure OG description defaults to meta description if not set
  if (!this.meta.openGraph?.description && this.meta.description) {
    if (!this.meta.openGraph) this.meta.openGraph = {};
    this.meta.openGraph.description = this.meta.description;
  }

  next();
});

const Page = mongoose.model("Page", PageSchema);

export default Page;
