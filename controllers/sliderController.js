import fs from "fs";
import path from "path";
import Slider from "../models/sliderModel.js"; // Updated Slider model name
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define MAIN_DIR for uploads
const MAIN_DIR = path.resolve(__dirname, "../uploads/main");

// Function to create a new slider
export const createSlider = async (req, res) => {
  try {
    console.log("Files received:", req.files);
    console.log("Request body:", req.body);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;
    const { title, description, buttonText, buttonLink } = req.body;

    if (!img || !img[0]?.path) {
      return res.status(400).json({ message: "Slider image is required" });
    }

    const imagePath = path.join(folderName, path.basename(img[0].path));
    console.log("Generated Image Path:", imagePath);

    const newSlider = new Slider({
      title,
      description,
      buttonText,
      buttonLink,
      img: imagePath,
    });

    await newSlider.save();

    res
      .status(201)
      .json({ message: "Slider created successfully", slider: newSlider });
  } catch (error) {
    console.error("Error creating slider:", error);
    res.status(500).json({ message: "Error creating slider", error });
  }
};

// Function to update an existing slider
export const updateSlider = async (req, res) => {
  try {
    const sliderId = req.params.id;

    const existingSlider = await Slider.findById(sliderId);
    if (!existingSlider) {
      return res.status(404).json({ message: "Slider not found" });
    }

    console.log("Existing Slider Record:", existingSlider);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;
    const { title, description, buttonText, buttonLink } = req.body;

    // Only delete old image if a new image is uploaded
    if (img && img[0]?.path) {
      // Check if an existing image path is available and delete it
      if (existingSlider.img) {
        const oldImagePath = path.resolve(
          MAIN_DIR,
          existingSlider.img.replace(/\\/g, "/")
        );
        console.log(`Resolved Old Path for Deletion: ${oldImagePath}`);

        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(
              `Old slider image deleted successfully: ${oldImagePath}`
            );
          } catch (error) {
            console.error(
              `Failed to delete old slider image: ${oldImagePath}`,
              error.message
            );
            return res.status(500).json({
              message: "Error deleting old slider image",
              error: error.message,
            });
          }
        } else {
          console.warn(`Old image does not exist at: ${oldImagePath}`);
        }
      }

      // Save new image path
      const newImagePath = path.join(folderName, path.basename(img[0].path));
      console.log(`New Image Path: ${newImagePath}`);
      existingSlider.img = newImagePath;
    }
    // If no new image is uploaded, keep the existing image

    // Update other fields
    existingSlider.title = title || existingSlider.title;
    existingSlider.description = description || existingSlider.description;
    existingSlider.buttonText = buttonText || existingSlider.buttonText;
    existingSlider.buttonLink = buttonLink || existingSlider.buttonLink;

    const updatedSlider = await existingSlider.save();
    console.log("Slider updated successfully:", updatedSlider);
    res
      .status(200)
      .json({ message: "Slider updated successfully", slider: updatedSlider });
  } catch (error) {
    console.error("Error updating slider:", error);
    res.status(500).json({ message: "Error updating slider", error });
  }
};
// Function to delete a slider
export const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }

    const filePath = path.resolve(
      "uploads/main",
      slider.img.replace(/\\/g, "/")
    );
    console.log(`Resolved file path for deletion: ${filePath}`);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Slider image deleted successfully: ${filePath}`);
      } catch (error) {
        console.error(
          `Failed to delete slider image: ${filePath}`,
          error.message
        );
        return res
          .status(500)
          .json({
            message: "Error deleting slider image",
            error: error.message,
          });
      }
    } else {
      console.warn(`Slider image not found at: ${filePath}`);
    }

    res
      .status(200)
      .json({ message: "Slider and associated image deleted successfully" });
  } catch (error) {
    console.error("Error deleting slider:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting slider", error: error.message });
  }
};

// Function to get all sliders
export const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sliders", error });
  }
};
