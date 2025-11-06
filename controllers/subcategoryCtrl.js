import Subcategory from "../models/subcategoryModel.js";
import Category from "../models/categoryModel.js";

// Get all subcategories
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate('category', 'name slug');
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategories', error });
  }
};

// Get a single subcategory by ID
export const getSubcategoryById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const subcategory = await Subcategory.findById(id).populate('category', 'name slug');

    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });

    res.status(200).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategory', error });
  }
};

// Create a new subcategory
export const createSubcategory = async (req, res) => {
  const { name, slug, categoryId } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const newSubcategory = new Subcategory({ name, slug, category: categoryId });
    await newSubcategory.save();

    res.status(201).json(newSubcategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subcategory', error });
  }
};

// Update a subcategory
export const updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, categoryId } = req.body;

  try {
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, slug, category: categoryId },
      { new: true }
    );

    if (!updatedSubcategory) return res.status(404).json({ message: 'Subcategory not found' });

    res.status(200).json(updatedSubcategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subcategory', error });
  }
};

// Delete a subcategory
export const deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

    if (!deletedSubcategory) return res.status(404).json({ message: 'Subcategory not found' });

    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
};
