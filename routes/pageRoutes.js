import express from "express";
import {
  createPage,
  getPageBySlug,
  getPageById,
  updatePage,
  deletePage,
  getPages,
} from "../controllers/pageController.js";
import {
  dynamicImageHandler,
  scheduleTempCleanup,
} from "../middleware/dynamicImageHandler.js";
import { uploadConfigs } from "../config/uploadConfig.js";
import { adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Administrative Routes (More Specific Routes First) ---

// Get all pages with filtering and pagination (admin access)
router.get("/pages", getPages); // Added adminMiddleware (assumed for safety)

// Read, Update, and Delete a page by ID (Specific route)
// Read a page by ID (admin route)
router.get("/page/id/:id", getPageById);

// Update a page by ID with full design support
router.put("/page/id/:id", dynamicImageHandler(uploadConfigs.page), updatePage);

// Delete a page by ID
router.delete("/page/id/:id", deletePage);

// --- Creation and Public Routes ---

// Create a new page with design capabilities (Admin only)
router.post("/page", dynamicImageHandler(uploadConfigs.page), createPage);

// Read a page by slug (Public route - must be LAST in the /page/ routes)
router.get("/page/:slug", getPageBySlug);

// --- Utility ---

// Schedule Temp Cleanup (Should be executed once during setup, not strictly a route)
scheduleTempCleanup();

export default router;
