import { ProductSection } from "../models/HomeModel.js";


// Get all product sections
export const getProductSections = async (req, res) => {
  try {
    const productSections = await ProductSection.find().populate('product');
    res.status(200).json(productSections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product sections', error });
  }
};

// Create a new product section
export const createProductSection = async (req, res) => {
  const { product } = req.body;

  const newProductSection = new ProductSection({
    product,
  });

  try {
    await newProductSection.save();
    res.status(201).json(newProductSection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product section', error });
  }
};

// Update a product section
export const updateProductSection = async (req, res) => {
  const { id } = req.params;
  const { product } = req.body;

  try {
    const updatedProductSection = await ProductSection.findByIdAndUpdate(
      id,
      { product },
      { new: true }
    ).populate('product');
    res.status(200).json(updatedProductSection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product section', error });
  }
};

// Delete a product section
export const deleteProductSection = async (req, res) => {
  const { id } = req.params;

  try {
    await ProductSection.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product section', error });
  }
};
