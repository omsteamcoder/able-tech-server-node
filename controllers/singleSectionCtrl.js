import { SingleSection } from "../models/HomeModel.js";


// Get all single sections
export const getSingleSections = async (req, res) => {
  try {
    const singleSections = await SingleSection.find();
    res.status(200).json(singleSections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching single sections', error });
  }
};

// Create a new single section
export const createSingleSection = async (req, res) => {
  const { image, title, description } = req.body;

  const newSingleSection = new SingleSection({
    image,
    title,
    description,
  });

  try {
    await newSingleSection.save();
    res.status(201).json(newSingleSection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating single section', error });
  }
};

// Update a single section
export const updateSingleSection = async (req, res) => {
  const { id } = req.params;
  const { image, title, description } = req.body;

  try {
    const updatedSingleSection = await SingleSection.findByIdAndUpdate(
      id,
      { image, title, description },
      { new: true }
    );
    res.status(200).json(updatedSingleSection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating single section', error });
  }
};

// Delete a single section
export const deleteSingleSection = async (req, res) => {
  const { id } = req.params;

  try {
    await SingleSection.findByIdAndDelete(id);
    res.status(200).json({ message: 'Single section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting single section', error });
  }
};
