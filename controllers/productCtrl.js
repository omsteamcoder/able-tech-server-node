import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import path from "path";
import fs from "fs";

// Get all products with filtering and search
export const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      productType, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    let filter = {  };
    
    // Build filter object
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (productType) filter.productType = productType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { 'specifications.value': { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'name model slug images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get product by slug
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'name model slug images shortDescription');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'name model slug images');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

const generateSEO = (userMetaTitle, userMetaDescription, name, shortDescription, overview) => {
  const metaTitle = userMetaTitle && userMetaTitle.trim() !== '' 
    ? userMetaTitle 
    : name;

  const metaDescription = userMetaDescription && userMetaDescription.trim() !== '' 
    ? userMetaDescription 
    : (shortDescription || overview || '').substring(0, 160); // limit to 160 chars

  return { metaTitle, metaDescription };
};

// Simple slugify function
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
};




// Utility to normalize image info
const processFile = (file, type = "gallery", alt = "") => ({
  url: path.basename(file.path),
  alt,
  type,
});

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      model,
      categoryId,
      subcategoryId,
      shortDescription,
      fullDescription,
      overview,
      specifications,
      applications,
      features,
      keyBenefits,
      materials,
      technicalDetails,
      productType,
      subTypes,
      price,
      stock,
      isCustomizable,
      leadTime,
      metaTitle,
      metaDescription,
      keywords,
      status,
      relatedProducts,
    } = req.body;

    console.log("req.body:", req.body);

    // --- Parse JSON string fields ---
    const parseIfString = (field) => {
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return field;
    };

    const parsedSpecifications = parseIfString(specifications) || [];
    const parsedApplications = parseIfString(applications) || [];
    const parsedFeatures = parseIfString(features) || [];
    const parsedMaterials = parseIfString(materials) || {};
    const parsedTechnicalDetails = parseIfString(technicalDetails) || {};
    const parsedRelatedProducts = parseIfString(relatedProducts) || [];
    const parsedSubTypes = parseIfString(subTypes) || [];
    const parsedKeyBenefits = parseIfString(keyBenefits) || [];

    // --- Validate category/subcategory existence ---
    const category = await Category.findById(categoryId);
    const subcategory = await Subcategory.findById(subcategoryId);

    if (!category) return res.status(404).json({ message: "Category not found" });
    if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });

    // --- Handle price fields ---
    const priceBaseRaw = req.body["price.base"];
    const priceCurrency = req.body["price.currency"] || "USD";
    const priceUnit = req.body["price.unit"] || "unit";
    const priceBase = priceBaseRaw !== undefined ? parseFloat(priceBaseRaw) : 0;

    if (isNaN(priceBase)) {
      return res.status(400).json({ message: "Invalid price.base value. Must be a number." });
    }

    // --- Handle images ---
    const images = [];
    const diagrams = [];

    // Add main image
    if (req.files?.mainImage?.[0]) {
      images.push(processFile(req.files.mainImage[0], "main", name));
    }

    // Add gallery images, avoid duplicates
    if (req.files?.galleryImages) {
      req.files.galleryImages.forEach((file) => {
        const filename = path.basename(file.path);
        if (!images.some((img) => img.url === filename)) {
          images.push(processFile(file, "gallery", name));
        }
      });
    }

    // Add diagram images
    if (req.files?.diagramImages) {
      req.files.diagramImages.forEach((file) => {
        const filename = path.basename(file.path);
        diagrams.push({
          title: `${name} Diagram`,
          imageUrl: filename,
          description: "Technical diagram",
          type: "technical",
        });
      });
    }

    // --- SEO Handling ---
    const seo = generateSEO(metaTitle, metaDescription, name, shortDescription, overview);
    const finalSlug = slug && slug.trim() !== "" ? slug : generateSlug(name);
    const finalModel = model && model.trim() !== "" ? model : name.replace(/\s+/g, "_").toUpperCase();

    // --- Keywords handling ---
    let parsedKeywords = [];
    if (keywords) {
      if (typeof keywords === "string") {
        try {
          parsedKeywords = JSON.parse(keywords);
          if (!Array.isArray(parsedKeywords)) {
            parsedKeywords = keywords.split(",").map((k) => k.trim());
          }
        } catch {
          parsedKeywords = keywords.split(",").map((k) => k.trim());
        }
      } else if (Array.isArray(keywords)) {
        parsedKeywords = keywords;
      }
    }

    // --- Create product document ---
    const newProduct = new Product({
      name,
      slug: finalSlug,
      model: finalModel,
      category: categoryId,
      subcategory: subcategoryId,
      shortDescription,
      fullDescription,
      overview,
      specifications: parsedSpecifications,
      applications: parsedApplications,
      features: parsedFeatures,
      keyBenefits: parsedKeyBenefits,
      materials: parsedMaterials,
      technicalDetails: parsedTechnicalDetails,
      productType,
      subTypes: parsedSubTypes,
      images,
      diagrams,
      price: {
        base: priceBase,
        currency: priceCurrency,
        unit: priceUnit,
      },
      stock: parseInt(stock) || 0,
      isCustomizable: isCustomizable === "true" || false,
      leadTime,
      metaTitle: metaTitle && metaTitle.trim() !== "" ? metaTitle : seo.metaTitle,
      metaDescription:
        metaDescription && metaDescription.trim() !== "" ? metaDescription : seo.metaDescription,
      keywords: parsedKeywords.length > 0 ? parsedKeywords : seo.keywords || [],
      status: status || "active",
      relatedProducts: parsedRelatedProducts,
    });

    // --- Save product ---
    await newProduct.save();

    // --- Populate and return the saved product ---
    const populatedProduct = await Product.findById(newProduct._id)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("relatedProducts", "name model slug images");

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};
const parseJSON = (field) => {
  if (!field) return [];
  try {
    return Array.isArray(field) ? field : JSON.parse(field);
  } catch {
    return [];
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // --- Parse JSON fields ---
    const specifications = parseJSON(req.body.specifications);
    const applications = parseJSON(req.body.applications);
    const features = parseJSON(req.body.features);
    const keyBenefits = parseJSON(req.body.keyBenefits);
    const materials = req.body.materials ? JSON.parse(req.body.materials) : product.materials;
    const technicalDetails = req.body.technicalDetails ? JSON.parse(req.body.technicalDetails) : product.technicalDetails;
    const subTypes = parseJSON(req.body.subTypes);
    const keywords = parseJSON(req.body.keywords);
    const relatedProducts = parseJSON(req.body.relatedProducts);

    // --- Prepare update data ---
    const updateData = {
      name: req.body.name || product.name,
      slug: req.body.slug || product.slug,
      model: req.body.model || product.model,
      category: req.body.categoryId || product.category,
      subcategory: req.body.subcategoryId || product.subcategory,
      shortDescription: req.body.shortDescription || product.shortDescription,
      fullDescription: req.body.fullDescription || product.fullDescription,
      overview: req.body.overview || product.overview,
      productType: req.body.productType || product.productType,
      subTypes: subTypes.length ? subTypes : product.subTypes,
      specifications: specifications.length ? specifications : product.specifications,
      applications: applications.length ? applications : product.applications,
      features: features.length ? features : product.features,
      keyBenefits: keyBenefits.length ? keyBenefits : product.keyBenefits,
      materials,
      technicalDetails,
      leadTime: req.body.leadTime || product.leadTime,
      isCustomizable: req.body.isCustomizable === "true" || product.isCustomizable,
      isPublished: req.body.isPublished === "true" || product.isPublished,
      metaTitle: req.body.metaTitle || product.metaTitle,
      metaDescription: req.body.metaDescription || product.metaDescription || req.body.shortDescription,
      keywords: keywords.length ? keywords : product.keywords,
      status: req.body.status || product.status,
      price: {
        base: Number(req.body["price.base"] || product.price.base || 0),
        currency: req.body["price.currency"] || product.price.currency || "USD",
        unit: req.body["price.unit"] || product.price.unit || "unit",
      },
      stock: Number(req.body.stock || product.stock || 0),
      relatedProducts: relatedProducts.length ? relatedProducts : product.relatedProducts,
    };

    // --- Handle images ---
    let images = [];

    // 1️⃣ Start with frontend-provided existing images
    if (req.body.images) {
      try {
        images = JSON.parse(req.body.images);
      } catch {
        images = product.images || [];
      }
    }

    // 2️⃣ Add new gallery images first
    if (req.files?.galleryImages) {
      const newGallery = req.files.galleryImages.map(file => ({
        url: path.basename(file.path),
        alt: updateData.name,
        type: "gallery",
      }));
      images = [...images, ...newGallery];
    }

    // 3️⃣ Promote main image if mainImageUrl provided (existing image)
    if (req.body.mainImageUrl) {
      images.forEach(img => {
        img.type = img.url === req.body.mainImageUrl ? "main" : "gallery";
      });
    }

    // 4️⃣ Handle newly uploaded main image
    if (req.files?.mainImage?.[0]) {
      const oldMain = images.find(img => img.type === "main");
      if (oldMain) {
        // Demote old main to gallery (unless it's being deleted)
        oldMain.type = "gallery";
      }

      const newMainFile = {
        url: path.basename(req.files.mainImage[0].path),
        alt: updateData.name,
        type: "main",
      };

      // Remove duplicate if somehow exists
      images = images.filter(img => img.url !== newMainFile.url);

      // Add new main at front
      images = [newMainFile, ...images];
    }

    // 5️⃣ Remove deleted image files from disk
    const oldImages = product.images || [];
    const removedImages = oldImages.filter(oldImg => !images.some(img => img.url === oldImg.url));
    removedImages.forEach(img => {
      const imgPath = path.join("uploads/main/products", img.url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });

    updateData.images = images;

    // --- Handle diagrams ---
    let diagrams = product.diagrams || [];
    if (req.body.diagrams) {
      try {
        diagrams = JSON.parse(req.body.diagrams);
      } catch {
        diagrams = product.diagrams || [];
      }
    }

    if (req.files?.diagramImages) {
      const newDiagrams = req.files.diagramImages.map(file => ({
        title: `${updateData.name} Diagram`,
        imageUrl: path.basename(file.path),
        description: "Technical diagram",
        type: "technical",
      }));
      diagrams = [...diagrams, ...newDiagrams];
    }
    updateData.diagrams = diagrams;

    // --- Update product ---
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("relatedProducts", "name model slug images");

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
// Delete product permanently
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted permanently', product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
// Get products by type
export const getProductsByType = async (req, res) => {
  const { type } = req.params;

  try {
    const products = await Product.find({ 
      productType: type,
      status: 'active'
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .select('name model slug shortDescription images price technicalDetails');

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by type', error: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  const { q } = req.query;

  try {
    const products = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { 'specifications.value': { $regex: q, $options: 'i' } }
      ]
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .select('name model slug shortDescription images price')
      .limit(20);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};