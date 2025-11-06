// controllers/PageController.js
import Page from "../models/pageModel.js";
import slugify from "slugify";
import path from "path";
import fs from "fs/promises";

/**
 * Page Controller - Handles all page operations with clean separation of concerns
 */

export class PageService {
  /**
   * Create a new page with automatic slug generation
   */
  static async createPage(pageData, files = {}) {
    try {
      const {
        title,
        content,
        layout = {},
        meta = {},
        blocks = [],
        category = "general",
        tags = [],
        status = "draft",
      } = pageData;

      // Generate unique slug
      const slug = await Page.generateSlug(title);

      // Process uploaded files
      const filePaths = this.processUploadedFiles(files);

      // Create page with normalized data
      const page = new Page({
        title: title.trim(),
        slug,
        content: content || null,
        layout: this.normalizeLayout(layout),
        meta: this.normalizeMeta(meta, title),
        blocks: this.normalizeBlocks(blocks),
        category: category.trim(),
        tags: this.normalizeTags(tags), // <--- FIXED TAGS LOGIC
        status,
        thumbnail: filePaths.thumbnail || "",
        images: filePaths.images || [],
        backgroundImage: filePaths.backgroundImage || "",
        sectionBackgroundImages: filePaths.sectionBackgroundImages || [],
      });

      await page.save();
      return page;
    } catch (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  static normalizeLayout(layout, existingLayout = {}) {
    // If layout is a string, parse it
    let layoutData = layout;
    if (typeof layout === "string") {
      try {
        layoutData = JSON.parse(layout);
      } catch (error) {
        console.warn("Failed to parse layout JSON, using defaults");
        layoutData = {};
      }
    }

    return {
      backgroundColor:
        layoutData.backgroundColor ||
        existingLayout.backgroundColor ||
        "#ffffff",
      textColor: layoutData.textColor || existingLayout.textColor || "#000000",
      fontFamily:
        layoutData.fontFamily ||
        existingLayout.fontFamily ||
        "Inter, sans-serif",
      fontSize: layoutData.fontSize || existingLayout.fontSize || "16px",
      containerWidth:
        layoutData.containerWidth || existingLayout.containerWidth || "1200px",
      containerPadding:
        layoutData.containerPadding ||
        existingLayout.containerPadding ||
        "20px",
      customCSS: layoutData.customCSS || existingLayout.customCSS || "",
    };
  }

  // Update normalizeMeta to use existing data and generate smart defaults
  static normalizeMeta(meta, title, existingMeta = {}, thumbnail = "") {
    // If meta is a string, parse it
    let metaData = meta;
    if (typeof meta === "string") {
      try {
        metaData = JSON.parse(meta);
      } catch (error) {
        console.warn("Failed to parse meta JSON, using defaults");
        metaData = {};
      }
    }

    // Generate smart defaults
    const defaultMetaTitle = title || existingMeta.title || "";
    const defaultDescription =
      metaData.description ||
      existingMeta.description ||
      `${title} - Page description`;

    // Use thumbnail for OG image if available
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const ogImage =
      metaData.openGraph?.image ||
      existingMeta.openGraph?.image ||
      (thumbnail ? `${baseUrl}/uploads/${thumbnail}` : "");

    return {
      title: metaData.title || existingMeta.title || defaultMetaTitle,
      description:
        metaData.description || existingMeta.description || defaultDescription,
      keywords: metaData.keywords || existingMeta.keywords || [],
      canonicalUrl: metaData.canonicalUrl || existingMeta.canonicalUrl || "",
      openGraph: {
        title:
          metaData.openGraph?.title ||
          existingMeta.openGraph?.title ||
          defaultMetaTitle,
        description:
          metaData.openGraph?.description ||
          existingMeta.openGraph?.description ||
          defaultDescription,
        image: ogImage,
        url: metaData.openGraph?.url || existingMeta.openGraph?.url || "",
      },
    };
  }
  /**
   * Update existing page
   */
  static async updatePage(pageId, updates, files = {}) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error("Page not found");
      }

      // Handle title change and slug regeneration
      if (updates.title && updates.title !== page.title) {
        updates.slug = await Page.generateSlug(updates.title);
      }

      // Process uploaded files
      const filePaths = this.processUploadedFiles(files);

      // Merge file paths with updates
      const fileUpdates = {};
      if (filePaths.thumbnail) {
        fileUpdates.thumbnail = filePaths.thumbnail;
      }
      if (filePaths.images && filePaths.images.length > 0) {
        fileUpdates.images = [...(page.images || []), ...filePaths.images];
      }
      if (filePaths.backgroundImage) {
        fileUpdates.backgroundImage = filePaths.backgroundImage;
      }
      if (
        filePaths.sectionBackgroundImages &&
        filePaths.sectionBackgroundImages.length > 0
      ) {
        fileUpdates.sectionBackgroundImages = [
          ...(page.sectionBackgroundImages || []),
          ...filePaths.sectionBackgroundImages,
        ];
      }

      // Normalize structured data with proper fallbacks
      // This now correctly calls the single, robust normalizeLayout/Meta functions
      if (updates.layout) {
        updates.layout = this.normalizeLayout(updates.layout, page.layout);
      }

      if (updates.meta) {
        updates.meta = this.normalizeMeta(
          updates.meta,
          updates.title || page.title,
          page.meta,
          fileUpdates.thumbnail || page.thumbnail
        );
      }

      if (updates.blocks) {
        updates.blocks = this.normalizeBlocks(updates.blocks);
      }

      if (updates.tags) {
        updates.tags = this.normalizeTags(updates.tags); // <--- FIXED TAGS LOGIC
      }

      // Handle featured field properly
      if (updates.featured !== undefined) {
        updates.featured =
          updates.featured === "true" || updates.featured === true;
      }

      // Merge all updates including files
      const finalUpdates = {
        ...updates,
        ...fileUpdates,
      };

      // Update page
      Object.assign(page, finalUpdates);
      await page.save();

      return page;
    } catch (error) {
      throw new Error(`Failed to update page: ${error.message}`);
    }
  }

  /**
   * Get page by slug with view counting
   */
  static async getPageBySlug(slug, incrementViews = true) {
    try {
      console.log(slug);
      
      const page = await Page.findOne({ slug, status: "published" });
      console.log(page);
      
      if (!page) {
        throw new Error("Page not found");
      }

      if (incrementViews) {
        await page.incrementViews();
      }

      return page;
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  /**
   * Get page by ID
   */
  static async getPageById(id) {
    try {
      const page = await Page.findById(id);
      if (!page) {
        throw new Error("Page not found");
      }
      return page;
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  /**
   * Get all pages with filtering and pagination
   */
  static async getPages(options = {}) {
    const {
      status,
      category,
      featured,
      limit = 50,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [pages, total] = await Promise.all([
      Page.find(filter)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .select("-content -layout.customCSS -blocks.data.styles.customCSS"),
      Page.countDocuments(filter),
    ]);

    return {
      pages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Delete page and associated files
   */
  static async deletePage(pageId) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error("Page not found");
      }

      // Delete associated files
      await this.deletePageFiles(page);

      await Page.findByIdAndDelete(pageId);
      return { message: "Page deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  }

  /**
   * Process uploaded files and return normalized paths
   */
  static processUploadedFiles(files) {
    const filePaths = {};

    if (files.thumbnail?.[0]) {
      filePaths.thumbnail = files.thumbnail[0].path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "");
    }

    if (files.images) {
      filePaths.images = files.images.map((file) =>
        file.path.replace(/\\/g, "/").replace(/^.*uploads\//, "")
      );
    }

    if (files.backgroundImage?.[0]) {
      filePaths.backgroundImage = files.backgroundImage[0].path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "");
    }

    if (files.sectionBackgroundImages) {
      filePaths.sectionBackgroundImages = files.sectionBackgroundImages.map(
        (file) => file.path.replace(/\\/g, "/").replace(/^.*uploads\//, "")
      );
    }

    return filePaths;
  }
  
  /**
   * Normalize tags input to an array of trimmed strings.
   * Handles comma-separated strings and JSON string arrays.
   */
  static normalizeTags(tags) { // <--- NEW HELPER FUNCTION
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }
    if (typeof tags === "string") {
      // 1. Attempt to parse as JSON array (to fix heavily escaped strings)
      try {
        const parsedTags = JSON.parse(tags);
        if (Array.isArray(parsedTags)) {
          return parsedTags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
        }
      } catch (e) {
        // Fall through to comma-separated split
      }
      
      // 2. Fallback to comma-separated string split
      return tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  }

  /**
   * Normalize blocks array with proper structure
   */
  static normalizeBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      try {
        blocks = typeof blocks === "string" ? JSON.parse(blocks) : [];
      } catch {
        blocks = [];
      }
    }

    return blocks.map((block, index) => ({
      id: block.id || `block-${Date.now()}-${index}`,
      type: block.type || "text",
      order: block.order || index,
      styles: {
        backgroundColor: block.styles?.backgroundColor || "transparent",
        textColor: block.styles?.textColor || "inherit",
        fontFamily: block.styles?.fontFamily || "inherit",
        fontSize: block.styles?.fontSize || "inherit",
        padding: block.styles?.padding || "20px",
        margin: block.styles?.margin || "0px",
        customCSS: block.styles?.customCSS || "",
      },
      data: block.data || block, // Support both new and old structure
    }));
  }

  /**
   * Delete files associated with a page
   */
  static async deletePageFiles(page) {
    const filesToDelete = [];

    // Delete thumbnail
    if (page.thumbnail) {
      filesToDelete.push(`uploads/${page.thumbnail}`);
    }

    // Delete images array
    if (page.images?.length > 0) {
      page.images.forEach((image) => {
        filesToDelete.push(`uploads/${image}`);
      });
    }

    // Delete background image
    if (page.backgroundImage) {
      filesToDelete.push(`uploads/${page.backgroundImage}`);
    }

    // Delete section background images array
    if (page.sectionBackgroundImages?.length > 0) {
      page.sectionBackgroundImages.forEach((image) => {
        filesToDelete.push(`uploads/${image}`);
      });
    }

    // Delete files in parallel
    await Promise.all(
      filesToDelete.map(async (filePath) => {
        try {
          // Using path.join here might be safer, but sticking to original fs.unlink
          // Note: The original code uses fs.promises and path, but the file paths seem to be relative paths from 'uploads/'
          await fs.unlink(filePath);
        } catch (error) {
          console.warn(`Failed to delete file: ${filePath}`, error.message);
        }
      })
    );
  }
}

export const createPage = async (req, res) => {
  try {
    const page = await PageService.createPage(req.body, req.files);
    res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: page,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get page by slug (public route)
 */
export const getPageBySlug = async (req, res) => {
  try {
    const page = await PageService.getPageBySlug(req.params.slug);
    console.log(page);
    
    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get page by ID (admin route)
 */
export const getPageById = async (req, res) => {
  try {
    const page = await PageService.getPageById(req.params.id);
    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all pages with filtering
 */
export const getPages = async (req, res) => {
  try {
    const result = await PageService.getPages(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update page by ID
 */
export const updatePage = async (req, res) => {
  try {
    const page = await PageService.updatePage(
      req.params.id,
      req.body,
      req.files
    );
    res.json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete page by ID
 */
export const deletePage = async (req, res) => {
  try {
    const result = await PageService.deletePage(req.params.id);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};