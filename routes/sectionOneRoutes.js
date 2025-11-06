// routes/sectionOneRoutes.js
import express from "express";
import { 
  createSectionOne, 
  getSectionOne,       // <-- Get single item by ID
  updateSectionOne,    // <-- Update single item by ID
  deleteSectionOne, 
  getAllSections       // <-- Get all items
} from "../controllers/sectionOneController.js";
import { dynamicImageHandler } from "../middleware/dynamicImageHandler.js";
import { uploadConfigs } from "../config/uploadConfig.js";


const router = express.Router();

// Get all SectionOne content (for list/admin view)
router.get("/", getAllSections); // Note: Renamed controller

// POST new SectionOne content
router.post("/", dynamicImageHandler(uploadConfigs.sectionOne), createSectionOne);

// GET single SectionOne content by ID (for editor pre-fill)
// 🎯 FIX: New route with ID parameter
router.get("/:id", getSectionOne); 

// PUT update single SectionOne content by ID
// 🎯 FIX: Route updated to include ID parameter
router.put("/:id", dynamicImageHandler(uploadConfigs.sectionOne), updateSectionOne); 

// DELETE single SectionOne content by ID
router.delete("/:id", deleteSectionOne);


export default router;