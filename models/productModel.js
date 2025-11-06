import mongoose from 'mongoose';
const { Schema } = mongoose;

const specificationSchema = new Schema({
  key: { type: String },
  value: { type: String },
  unit: { type: String },
  category: { type: String } // technical, performance, material, etc.
});

const applicationSchema = new Schema({
  industry: { type: String },
  useCase: { type: String },
  description: { type: String }
});

const featureSchema = new Schema({
  title: { type: String },
  description: { type: String },
  icon: { type: String }
});

const diagramSchema = new Schema({
  title: { type: String },
  imageUrl: { type: String },
  description: { type: String },
  type: { type: String, enum: ['technical', 'schematic', 'installation', 'dimensional'] }
});

const productSchema = new Schema({
  // ESSENTIAL FIELDS
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  price: { 
    base: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    unit: { type: String, default: 'unit' }
  },
  stock: { type: Number, default: 0 },
  images: [{ 
    url: { type: String, required: true }, // Only main image required
    alt: { type: String },
    type: { type: String, enum: ['main', 'gallery', 'diagram'], default: 'gallery' }
  }],
  shortDescription: { type: String },

  // ADVANCED / COLLAPSIBLE FIELDS
  fullDescription: { type: String },
  overview: { type: String },
  specifications: [specificationSchema],
  applications: [applicationSchema],
  features: [featureSchema],
  keyBenefits: [{ type: String }],
  diagrams: [diagramSchema],
  materials: {
    tubes: [{ type: String }],
    fins: [{ type: String }],
    casings: [{ type: String }],
    otherMaterials: [{ type: String }]
  },
  technicalDetails: {
    tubeDiameters: [{ type: String }],
    finPitches: [{ type: String }],
    pressureRating: { type: String },
    temperatureRange: { type: String },
    capacity: { type: String }
  },
  productType: { type: String },
  subTypes: [{ type: String }],
  isCustomizable: { type: Boolean, default: false },
  leadTime: { type: String },
  relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  documents: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['datasheet', 'manual', 'certificate', 'drawing'] }
  }],
  isPublished: { type: Boolean, default: false },

  // SEO (OPTIONAL)
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],

  // Status
  status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' }

}, { timestamps: true });

// Indexes
productSchema.index({ name: 'text', model: 'text', 'specifications.value': 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
