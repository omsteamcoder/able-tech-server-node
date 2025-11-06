import fs from 'fs';
import path from 'path';
import Gallery from '../models/galleryModel.js'; // Updated model name
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define MAIN_DIR for uploads
const MAIN_DIR = path.resolve(__dirname, '../uploads/main');

// Function to create a new gallery image
export const createGalleryImage = async (req, res) => {
  try {
    console.log("Files received:", req.files);
    console.log("Request body:", req.body);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;

    if (!img || !img[0]?.path) {
      return res.status(400).json({ message: "Gallery image is required" });
    }

    const imagePath = path.join(folderName, path.basename(img[0].path));
    console.log("Generated Image Path:", imagePath);

    const newGalleryImage = new Gallery({ img: imagePath });
    await newGalleryImage.save();

    res.status(201).json({ message: "Gallery image created successfully", image: newGalleryImage });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    res.status(500).json({ message: "Error creating gallery image", error });
  }
};

// Function to update an existing gallery image
export const updateGalleryImage = async (req, res) => {
  try {
    const imageId = req.params.id;

    // Find the existing image in the database
    const existingImage = await Gallery.findById(imageId);
    if (!existingImage) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    console.log("Existing Image Record:", existingImage);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;

    // Check if an existing image path is available
    if (existingImage.img) {
      const oldImagePath = path.resolve(MAIN_DIR, existingImage.img.replace(/\\/g, '/'));
      console.log(`Resolved Old Path for Deletion: ${oldImagePath}`);

      // Attempt to delete the old image
      if (fs.existsSync(oldImagePath)) {
        console.log(`Old image found at: ${oldImagePath}`);
        try {
          fs.unlinkSync(oldImagePath);
          console.log(`Old gallery image deleted successfully: ${oldImagePath}`);
        } catch (error) {
          console.error(`Failed to delete old gallery image: ${oldImagePath}`, error.message);
          return res.status(500).json({
            message: "Error deleting old gallery image",
            error: error.message,
          });
        }
      } else {
        console.warn(`Old image does not exist at: ${oldImagePath}`);
      }
    } else {
      console.warn("No old image path found in the database record.");
    }

    // Save new image if uploaded
    if (img && img[0]?.path) {
      const newImagePath = path.join(folderName, path.basename(img[0].path));
      console.log(`New Image Path: ${newImagePath}`);
      existingImage.img = newImagePath; // Update the image path in the database
    } else {
      return res.status(400).json({ message: "New gallery image is required" });
    }

    // Save the updated image document to the database
    const updatedImage = await existingImage.save();
    console.log("Gallery image updated successfully:", updatedImage);
    res.status(200).json({ message: "Gallery image updated successfully", image: updatedImage });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    res.status(500).json({ message: "Error updating gallery image", error });
  }
};

// Function to delete a gallery image
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the gallery image record in the database
    const image = await Gallery.findByIdAndDelete(id);
    if (!image) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    // Resolve the path of the associated image
    const filePath = path.resolve('uploads/main', image.img.replace(/\\/g, '/'));
    console.log(`Resolved file path for deletion: ${filePath}`);

    // Delete the gallery image file
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Gallery image deleted successfully: ${filePath}`);
      } catch (error) {
        console.error(`Failed to delete gallery image: ${filePath}`, error.message);
        return res.status(500).json({ message: 'Error deleting gallery image', error: error.message });
      }
    } else {
      console.warn(`Gallery image not found at: ${filePath}`);
    }

    res.status(200).json({ message: 'Gallery image and record deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error.message);
    res.status(500).json({ message: 'Error deleting gallery image', error: error.message });
  }
};

// Function to get all gallery images
export const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery images', error });
  }
};
