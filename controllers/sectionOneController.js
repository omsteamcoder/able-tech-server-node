import fs from "fs";
import path from "path";
import SectionOne from "../models/sectionOneModel.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAIN_DIR = path.resolve(__dirname, "../uploads/main");

// --- Helper for image cleanup ---
const unlinkOldImage = (imagePath) => {
    if (imagePath) {
        // Ensure path resolves correctly for deletion
        const fullPath = path.resolve(MAIN_DIR, imagePath.replace(/\\/g, "/"));
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`Old image deleted successfully: ${fullPath}`);
            } catch (error) {
                console.error(`Failed to delete image: ${fullPath}`, error.message);
            }
        } else {
            console.warn(`Image not found at: ${fullPath}`);
        }
    }
}
// ------------------------------------------------------------------

// POST /api/section-one
// 🎯 NEW: Function to create a new section record
export const createSectionOne = async (req, res) => {
    // ... (logic for creating a new section, similar to previous response)
    // NOTE: If you only have two existing records, you might not want a create endpoint. 
    // I'm keeping it for a complete CRUD structure.
    try {
        const { title, subtitle, description } = req.body;
        const { folderName } = req.uploadConfig;
        const { img } = req.files;

        let imagePath = null;
        if (img && img[0]?.path) {
            imagePath = path
                .join(folderName, path.basename(img[0].path))
                .replace(/\\/g, "/");
        }

        const newSection = await SectionOne.create({
            title,
            subtitle,
            description,
            img: imagePath
        });

        res.status(201).json({
            message: "Section created successfully",
            section: newSection,
        });
    } catch (error) {
        console.error("Error creating Section One:", error);
        res.status(500).json({ message: "Error creating Section One", error: error.message });
    }
};


// GET /api/section-one
// 🎯 RENAMED: Fetches all documents (for a list/admin view)
export const getAllSections = async (req, res) => {
    try {
        const sections = await SectionOne.find(); 

        if (!sections || sections.length === 0) {
            return res.status(404).json({ message: "No Section One content found" });
        }
        res.status(200).json(sections); // Returns an array
    } catch (error) {
        console.error("Error fetching all Section One content:", error);
        res
            .status(500)
            .json({ message: "Error fetching all Section One content", error: error.message });
    }
};

// GET /api/section-one/:id
// 🎯 FIX: Fetches a single section by ID (THE MISSING FUNCTIONALITY)
export const getSectionOne = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameter
        const section = await SectionOne.findById(id); // Use Mongoose findById

        if (!section) {
            return res.status(404).json({ message: `Section One content with ID ${id} not found` });
        }
        res.status(200).json(section); // Returns a single object
    } catch (error) {
        console.error("Error fetching Section One content by ID:", error);
        // Handle invalid ID format (e.g., CastError from Mongoose)
        res.status(400).json({ message: "Invalid section ID format", error: error.message });
    }
};

// PUT /api/section-one/:id
// 🎯 FIX: Finds and updates a single section by ID
export const updateSectionOne = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameter
        const { title, subtitle, description } = req.body;
        const { folderName } = req.uploadConfig;
        const { img } = req.files;

        // 1. Find the existing section by ID
        let section = await SectionOne.findById(id);

        if (!section) {
             return res.status(404).json({ message: `Section One content with ID ${id} not found for update` });
        }

        // 2. Handle image update and deletion
        if (img && img[0]?.path) {
            unlinkOldImage(section.img); // Clean up old image
            
            // Update with the new image path
            const newImagePath = path
                .join(folderName, path.basename(img[0].path))
                .replace(/\\/g, "/");
            section.img = newImagePath;
        }

        // 3. Update other fields
        section.title = title || section.title;
        section.subtitle = subtitle || section.subtitle;
        section.description = description || section.description;

        const updatedSection = await section.save();

        res
            .status(200)
            .json({
                message: "Section updated successfully",
                section: updatedSection,
            });
    } catch (error) {
        console.error("Error updating Section One:", error);
        res.status(500).json({ message: "Error updating Section One", error: error.message });
    }
};

// 🎯 NEW: Function to delete a section by ID
export const deleteSectionOne = async (req, res) => {
    try {
        const { id } = req.params;
        
        const section = await SectionOne.findByIdAndDelete(id);

        if (!section) {
            return res.status(404).json({ message: `Section One content with ID ${id} not found for deletion` });
        }

        // Clean up the image file
        unlinkOldImage(section.img); 

        res.status(200).json({ message: "Section deleted successfully", id });
    } catch (error) {
        console.error("Error deleting Section One:", error);
        res.status(400).json({ message: "Error deleting Section One", error: error.message });
    }
};