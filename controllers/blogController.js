import Blog from "../models/blogModel.js";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAIN_DIR = path.resolve(__dirname, "../uploads/main");

// Helper function to extract and process embedded images from content
const processEmbeddedImages = (content, contentImages) => {
  if (!content || !contentImages || contentImages.length === 0) {
    return content;
  }

  try {
    const blocks = JSON.parse(content);

    const processBlock = (block) => {
      if (
        block.type === "image" &&
        block.props?.url &&
        block.props.url.startsWith("blob:")
      ) {
        // Find the corresponding uploaded image
        const uploadedImage = contentImages.find((img) => {
          const fileName = path.basename(img.path);
          return (
            block.props.url.includes(fileName) ||
            fileName.includes(block.props.url)
          );
        });

        if (uploadedImage) {
          // Replace blob URL with actual server path
          const relativePath = uploadedImage.path.replace(
            /^.*[\\/]uploads[\\/]main[\\/]/,
            ""
          );
          block.props.url = `/uploads/main/${relativePath}`;
        }
      }

      // Process children recursively
      if (block.children && Array.isArray(block.children)) {
        block.children.forEach(processBlock);
      }

      return block;
    };

    const processedBlocks = blocks.map(processBlock);
    return JSON.stringify(processedBlocks);
  } catch (error) {
    console.warn("Error processing embedded images:", error);
    return content; // Return original content if processing fails
  }
};

/**
 * NEW HELPER FUNCTION: Extracts relative image paths from BlockNote JSON content.
 * The paths are relative to the MAIN_DIR (e.g., '1704204558004-my-image.jpg').
 */
const extractContentImagePaths = (content) => {
  if (!content) return new Set();
  const paths = new Set();
  try {
    const blocks = JSON.parse(content);
    const traverse = (blocksArray) => {
      if (!Array.isArray(blocksArray)) return;

      for (const block of blocksArray) {
        // Check for 'image' block type and its URL
        if (block.type === "image" && block.props?.url) {
          const url = block.props.url;

          // Only process server-side paths, which are stored as /uploads/main/filename.jpg
          if (url.startsWith("/uploads/main/")) {
            // Extract the filename (which is the relative path we want)
            const relativePath = url.replace("/uploads/main/", "");
            paths.add(relativePath);
          }
        }

        // Recursively check children
        if (block.children && Array.isArray(block.children)) {
          traverse(block.children);
        }
      }
    };
    traverse(blocks);
  } catch (error) {
    console.warn("Error extracting content image paths:", error);
  }
  return paths;
};

// Helper function to generate SEO fields from title and description
const generateSEOFields = (title, excerpt, existingSEO = {}) => {
  const {
    metaTitle: existingMetaTitle,
    metaDescription: existingMetaDesc,
    keywords: existingKeywords,
  } = existingSEO;

  // Generate meta title: use existing one, or title (truncated to 60 chars for SEO)
  let metaTitle = existingMetaTitle;
  if (!metaTitle || metaTitle.trim() === "") {
    metaTitle = title.trim().substring(0, 60);
  }

  // Generate meta description: use existing one, or excerpt, or truncate title
  let metaDescription = existingMetaDesc;
  if (!metaDescription || metaDescription.trim() === "") {
    if (excerpt && excerpt.trim() !== "") {
      metaDescription = excerpt.trim().substring(0, 160);
    } else {
      metaDescription = `${title.trim().substring(0, 120)}...`;
    }
  }

  // Generate keywords: use existing ones, or extract from title
  let keywords = existingKeywords;
  if (!keywords || keywords.length === 0) {
    // Extract keywords from title (remove special chars and split)
    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2); // Filter out short words
    keywords = [...new Set(titleWords)]; // Remove duplicates
  }

  return {
    metaTitle: metaTitle.substring(0, 60), // Ensure max length for SEO
    metaDescription: metaDescription.substring(0, 160),
    keywords: Array.isArray(keywords) ? keywords : [],
  };
};

// Create a new blog post with image upload
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      keywords,
      author,
      tags,
      published,
    } = req.body;

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Handle image paths from upload middleware
    const thumbnail = req.files?.thumbnail?.[0]?.path || "";
    const coverImage = req.files?.coverImage?.[0]?.path || "";
    const contentImages = req.files?.contentImages || [];

    // Process embedded images in content
    let processedContent = content;
    if (content && contentImages.length > 0) {
      processedContent = processEmbeddedImages(content, contentImages);
    }

    // Generate SEO fields if not provided
    const {
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDescription,
      keywords: finalKeywords,
    } = generateSEOFields(title, excerpt, {
      metaTitle,
      metaDescription,
      keywords,
    });

    const newBlog = new Blog({
      title,
      slug,
      content: processedContent,
      excerpt,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDescription,
      keywords: finalKeywords,
      author,
      thumbnail: thumbnail
        ? path.relative(path.join(MAIN_DIR, ".."), thumbnail)
        : "",
      coverImage: coverImage
        ? path.relative(path.join(MAIN_DIR, ".."), coverImage)
        : "",
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",") : [],
      published: published || false,
    });

    const savedBlog = await newBlog.save();

    // Convert relative paths to absolute URLs for response
    const responseBlog = {
      ...savedBlog.toObject(),
      thumbnail: savedBlog.thumbnail
        ? `${req.protocol}://${req.get("host")}/${savedBlog.thumbnail}`
        : "",
      coverImage: savedBlog.coverImage
        ? `${req.protocol}://${req.get("host")}/${savedBlog.coverImage}`
        : "",
    };

    res.status(201).json(responseBlog);
  } catch (error) {
    // Clean up uploaded files if blog creation fails
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
    }
    res.status(400).json({ error: error.message });
  }
};

// Update a blog post by slug with image upload
export const updateBlogBySlug = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      keywords, // User-provided comma-separated string
      author,
      tags,
      published,
    } = req.body;
    console.log("keywords got", req.body.keywords);

    // Find existing blog
    const existingBlog = await Blog.findOne({ slug: req.params.slug });
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Handle image paths from upload middleware
    const thumbnail = req.files?.thumbnail?.[0]?.path;
    const coverImage = req.files?.coverImage?.[0]?.path;
    const contentImages = req.files?.contentImages || [];

    // Process embedded images in content
    let processedContent = content;
    if (content && contentImages.length > 0) {
      processedContent = processEmbeddedImages(content, contentImages);
    }

    // --- NEW LOGIC FOR DELETING REMOVED CONTENT IMAGES ---

    // 1. Get image paths from OLD content (stored in the database)
    const oldImagePaths = extractContentImagePaths(existingBlog.content);

    // 2. Get image paths from NEW content (to be saved)
    const newImagePaths = extractContentImagePaths(
      processedContent || existingBlog.content
    );

    // 3. Find images to delete (in old but not in new)
    const imagesToDelete = [...oldImagePaths].filter(
      (path) => !newImagePaths.has(path)
    );

    // 4. Delete files from the disk
    for (const imageRelativePath of imagesToDelete) {
      // Reconstruct the full path to the file inside the MAIN_DIR
      const absoluteImagePath = path.join(MAIN_DIR, imageRelativePath);

      if (fs.existsSync(absoluteImagePath)) {
        try {
          fs.unlinkSync(absoluteImagePath);
          console.log("Deleted old content image:", imageRelativePath);
        } catch (error) {
          console.error("Error deleting old content image:", error);
        }
      } else {
        console.warn(
          "Could not find old content image to delete:",
          absoluteImagePath
        );
      }
    }
    // --- END NEW LOGIC ---

    // --- SEO PROCESSING FIX (Keywords are now prioritized) ---

    // 1. Manually resolve the keywords array from the user input string.
    const resolvedKeywords =
      keywords && typeof keywords === "string"
        ? keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k)
        : existingBlog.keywords; // Fallback to existing array

    console.log("existing keyword", existingBlog.keywords);

    // 2. Run generateSEOFields. We use resolvedKeywords for context.
    const {
      metaTitle: generatedMetaTitle,
      metaDescription: generatedMetaDescription,
      // We ignore the returned keywords
    } = generateSEOFields(
      title || existingBlog.title,
      excerpt || existingBlog.excerpt,
      {
        metaTitle: metaTitle || existingBlog.metaTitle,
        metaDescription: metaDescription || existingBlog.metaDescription,
        keywords: resolvedKeywords, // Pass the array for context/generation logic
      }
    );

    // 3. Prioritize user's direct input for metaTitle/metaDescription over generated values
    const finalMetaTitle = metaTitle || generatedMetaTitle;
    const finalMetaDescription = metaDescription || generatedMetaDescription;

    // --- END SEO PROCESSING FIX ---

    const updateData = {
      title: title || existingBlog.title,
      slug: title
        ? title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "")
        : existingBlog.slug,
      content: processedContent || existingBlog.content,
      excerpt: excerpt || existingBlog.excerpt,
      // Use the resolved/prioritized SEO fields
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDescription,
      keywords: resolvedKeywords, // <-- FIXED: Uses user-provided/existing array
      author: author || existingBlog.author,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t) // Process string tags
        : existingBlog.tags,
      published: published !== undefined ? published : existingBlog.published,
      updatedAt: Date.now(),
    };
    console.log("updated data", updateData);

    // Only update image fields if new images were uploaded
    if (thumbnail) {
      // Delete old thumbnail if exists
      if (existingBlog.thumbnail) {
        const oldThumbnailPath = path.join(
          MAIN_DIR,
          "..",
          existingBlog.thumbnail
        );
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      updateData.thumbnail = path.relative(
        path.join(MAIN_DIR, ".."),
        thumbnail
      );
    }

    if (coverImage) {
      // Delete old cover image if exists
      if (existingBlog.coverImage) {
        const oldCoverPath = path.join(MAIN_DIR, "..", existingBlog.coverImage);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }
      updateData.coverImage = path.relative(
        path.join(MAIN_DIR, ".."),
        coverImage
      );
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      updateData,
      { new: true }
    );

    // Convert relative paths to absolute URLs for response
    const responseBlog = {
      ...updatedBlog.toObject(),
      thumbnail: updatedBlog.thumbnail
        ? `${req.protocol}://${req.get("host")}/${updatedBlog.thumbnail}`
        : "",
      coverImage: updatedBlog.coverImage
        ? `${req.protocol}://${req.get("host")}/${updatedBlog.coverImage}`
        : "",
    };

    res.json(responseBlog);
  } catch (error) {
    // Clean up uploaded files if update fails
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
    }
    res.status(400).json({ error: error.message });
  }
};

// Get a blog post by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Convert relative paths to absolute URLs for frontend
    const blogWithAbsoluteUrls = {
      ...blog.toObject(),
      thumbnail: blog.thumbnail
        ? `${req.protocol}://${req.get("host")}/uploads/${blog.thumbnail}`
        : "",
      coverImage: blog.coverImage
        ? `${req.protocol}://${req.get("host")}/uploads/${blog.coverImage}`
        : "",
    };

    res.json(blogWithAbsoluteUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blog posts (with optional pagination)
export const getAllBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const blogs = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalBlogs = await Blog.countDocuments();

    // Convert relative paths to absolute URLs for all blogs
    const blogsWithAbsoluteUrls = blogs.map((blog) => ({
      ...blog.toObject(),
      thumbnail: blog.thumbnail
        ? `${req.protocol}://${req.get("host")}/uploads/${blog.thumbnail}`
        : "",
      coverImage: blog.coverImage
        ? `${req.protocol}://${req.get("host")}/uploads/${blog.coverImage}`
        : "",
    }));

    res.json({ total: totalBlogs, blogs: blogsWithAbsoluteUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a blog post by slug
// Delete a blog post by slug
export const deleteBlogBySlug = async (req, res) => {
  try {
    const deletedBlog = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // --- NEW LOGIC: Delete all embedded content images ---

    // 1. Extract all content image paths from the deleted blog's content
    const contentImagePaths = extractContentImagePaths(deletedBlog.content);

    // 2. Delete files from the disk
    for (const imageRelativePath of contentImagePaths) {
      // Reconstruct the full path to the file inside the MAIN_DIR
      const absoluteImagePath = path.join(MAIN_DIR, imageRelativePath);

      if (fs.existsSync(absoluteImagePath)) {
        try {
          fs.unlinkSync(absoluteImagePath);
          console.log(
            "Deleted content image on blog deletion:",
            imageRelativePath
          );
        } catch (error) {
          console.error(
            "Error deleting content image on blog deletion:",
            error
          );
        }
      }
    }

    // --- END NEW LOGIC ---

    // Delete associated thumbnail image
    if (deletedBlog.thumbnail) {
      const thumbnailPath = path.join(MAIN_DIR, "..", deletedBlog.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Delete associated cover image
    if (deletedBlog.coverImage) {
      const coverPath = path.join(MAIN_DIR, "..", deletedBlog.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const contentImageUploadHandler = (req, res) => {
  try {
    const uploadedImage = req.files?.contentImages?.[0];
    if (!uploadedImage) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const relativePath = uploadedImage.path.replace(
      /^.*[\\/]uploads[\\/]main[\\/]/,
      ""
    );
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/main/${relativePath}`;

    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const contentImageDeleteHandler = async (req, res) => {
  try {
    const { imagePath } = req.body; // e.g., 'blogs/content/filename.webp'
    console.log("--- DELETE TRACE START ---");
    console.log("1. Image Path Received from Client:", imagePath);

    if (!imagePath) {
      console.log("Error: Image path is required.");
      return res.status(400).json({ error: "Image path is required." });
    }

    // Construct the full absolute path
    // MAIN_DIR should point to the root of your upload folder (e.g., /project/uploads/main)
    const absoluteImagePath = path.join(MAIN_DIR, imagePath);

    console.log(
      "2. Absolute Path Constructed (MAIN_DIR + imagePath):",
      absoluteImagePath
    );

    // Security check
    if (!absoluteImagePath.startsWith(MAIN_DIR)) {
      console.error(
        "3. SECURITY FAIL: Path traversal detected:",
        absoluteImagePath
      );
      return res.status(403).json({ error: "Invalid file path." });
    }

    // Check if the file exists using synchronous fs.existsSync for immediate result
    if (fs.existsSync(absoluteImagePath)) {
      console.log("4. EXISTS: File found on disk. Attempting DELETION...");

      // 🎯 CRITICAL FIX: Use await with the Promise-based unlink
      await fsPromises.unlink(absoluteImagePath);

      console.log("5. SUCCESS: Real-time deleted content image:", imagePath);
      return res.json({ message: "Image deleted successfully." });
    } else {
      console.log(
        "4. NOT FOUND: File does not exist at path:",
        absoluteImagePath
      );
      return res.json({
        message: "Image not found on disk (already deleted).",
      });
    }
  } catch (error) {
    // This catches errors from fsPromises.unlink (e.g., permission denied, system error)
    console.error(
      "5. ERROR: Failed to delete image file:",
      error.message,
      error.code
    );
    res
      .status(500)
      .json({ error: `Failed to delete file on server: ${error.message}` });
  } finally {
    console.log("--- DELETE TRACE END ---");
  }
};
