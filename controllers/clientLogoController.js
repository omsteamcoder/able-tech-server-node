import fs from 'fs';
import path from 'path';
import ClientLogo from '../models/clientLogoModel.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define MAIN_DIR here
const MAIN_DIR = path.resolve(__dirname, '../uploads/main');


// Function to create a new client logo
export const createClientLogo = async (req, res) => {
  try {
    console.log("Files received:", req.files);
    console.log("Request body:", req.body);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;

    if (!img || !img[0]?.path) {
      return res.status(400).json({ message: "Logo image is required" });
    }

    const logoPath = path.join(folderName, path.basename(img[0].path));
    console.log("Generated Logo Path:", logoPath);

    const newClientLogo = new ClientLogo({ img: logoPath });
    await newClientLogo.save();

    res.status(201).json({ message: "Client logo created successfully", logo: newClientLogo });
  } catch (error) {
    console.error("Error creating client logo:", error);
    res.status(500).json({ message: "Error creating client logo", error });
  }
};


export const updateClientLogo = async (req, res) => {
  try {
    const logoId = req.params.id;

    // Find the existing logo in the database
    const existingLogo = await ClientLogo.findById(logoId);
    if (!existingLogo) {
      return res.status(404).json({ message: "Client logo not found" });
    }

    console.log("Existing Logo Record:", existingLogo);

    const { folderName } = req.uploadConfig;
    const { img } = req.files;

    // Check if `img` is set in the database record
    if (existingLogo.img) {
      const oldImagePath = path.resolve(MAIN_DIR, existingLogo.img.replace(/\\/g, '/'));
      console.log(`Resolved Old Path for Deletion: ${oldImagePath}`);

      // Attempt to delete the old logo image if it exists
      if (fs.existsSync(oldImagePath)) {
        console.log(`Old image found at: ${oldImagePath}`);
        try {
          fs.unlinkSync(oldImagePath);
          console.log(`Old logo image deleted successfully: ${oldImagePath}`);
        } catch (error) {
          console.error(`Failed to delete old logo image: ${oldImagePath}`, error.message);
          return res.status(500).json({
            message: "Error deleting old logo image",
            error: error.message,
          });
        }
      } else {
        console.warn(`Old image does not exist at: ${oldImagePath}`);
      }
    } else {
      console.warn("No old logo path found in the database record.");
    }

    // If a new logo image is uploaded
    if (img && img[0]?.path) {
      const newLogoPath = path.join(folderName, path.basename(img[0].path));
      console.log(`New Logo Path: ${newLogoPath}`);
      existingLogo.img = newLogoPath; // Save the new image path to the database
    } else {
      return res.status(400).json({ message: "New logo image is required" });
    }

    // Save the updated logo document to the database
    const updatedLogo = await existingLogo.save();
    console.log("Client logo updated successfully:", updatedLogo);
    res.status(200).json({ message: "Client logo updated successfully", logo: updatedLogo });
  } catch (error) {
    console.error("Error updating client logo:", error);
    res.status(500).json({ message: "Error updating client logo", error });
  }
};











// Function to delete a client logo and its image
export const deleteClientLogo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the client logo record in the database
    const logo = await ClientLogo.findByIdAndDelete(id);
    if (!logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }

    // Resolve the path of the associated image in the uploads directory
    const filePath = path.resolve('uploads/main', logo.img.replace(/\\/g, '/'));
    console.log(`Resolved file path for deletion: ${filePath}`);

    // Delete the logo image from the file system
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Logo image deleted successfully: ${filePath}`);
      } catch (error) {
        console.error(`Failed to delete logo image: ${filePath}`, error.message);
        return res.status(500).json({ message: 'Error deleting logo image', error: error.message });
      }
    } else {
      console.warn(`Logo image not found at: ${filePath}`);
    }

    res.status(200).json({ message: 'Client logo and image deleted successfully' });
  } catch (error) {
    console.error('Error deleting client logo:', error.message);
    res.status(500).json({ message: 'Error deleting client logo', error: error.message });
  }
};

// Function to get all client logos
export const getClientLogos = async (req, res) => {
  try {
    const logos = await ClientLogo.find();
    res.status(200).json(logos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client logos', error });
  }
};
