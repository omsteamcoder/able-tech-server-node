import Category from "../models/categoryModel.js";


// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const category = await Category.findById(id);
    console.log(category,id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  try {
    const newCategory = new Category({ name, slug });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};


// Get a single category by slug
export const getCategoryBySlug = async (req, res) => {
    const { slug } = req.params;
  
    try {
      const category = await Category.findOne({ slug });
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category by slug', error });
    }
  };
  

// Delete a category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
