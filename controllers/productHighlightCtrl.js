import { AdminProductHighlight } from "../models/HomeModel.js";


// Get all admin product highlights
export const getAdminProductHighlights = async (req, res) => {
  try {
    const highlights = await AdminProductHighlight.find().populate('product');
    res.status(200).json(highlights);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product highlights', error });
  }
};

// Create a new admin product highlight
export const createAdminProductHighlight = async (req, res) => {
  const { product } = req.body;

  const newHighlight = new AdminProductHighlight({
    product,
  });

  try {
    await newHighlight.save();
    res.status(201).json(newHighlight);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product highlight', error });
  }
};

// Delete a product highlight
export const deleteAdminProductHighlight = async (req, res) => {
  const { id } = req.params;

  try {
    await AdminProductHighlight.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product highlight', error });
  }
};
