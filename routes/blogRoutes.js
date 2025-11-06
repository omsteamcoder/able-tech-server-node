import express from "express";
import {
  createBlog,
  getBlogBySlug,
  getAllBlogs,
  updateBlogBySlug,
  deleteBlogBySlug,
  contentImageUploadHandler,
  contentImageDeleteHandler,
} from "../controllers/blogController.js";
import { dynamicImageHandler } from "../middleware/dynamicImageHandler.js";
import { uploadConfigs } from "../config/uploadConfig.js";

const router = express.Router();

// Create a new blog post with image upload
router.post("/", dynamicImageHandler(uploadConfigs.blog), createBlog);

// Get all blog posts
router.get("/", getAllBlogs);

// Get a specific blog post by slug
router.get("/:slug", getBlogBySlug);

// Update a blog post with image upload
router.put("/:slug", dynamicImageHandler(uploadConfigs.blog), updateBlogBySlug);

router.delete("/delete-content-image", contentImageDeleteHandler);
// Delete a blog post
router.delete("/:slug", deleteBlogBySlug);

router.post(
  "/upload-content-image",
  dynamicImageHandler({
    folderName: "blogs/content",
    sizes: [
      { fieldName: "contentImages", width: 800, height: 600, single: true },
    ],
  }),
  contentImageUploadHandler
);

export default router;
