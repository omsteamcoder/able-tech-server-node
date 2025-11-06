import { Banner } from "../models/HomeModel.js";


// Get all banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error });
  }
};

// Create a new banner
export const createBanner = async (req, res) => {
  const { title, description, image, buttonText, buttonLink } = req.body;

  const newBanner = new Banner({
    title,
    description,
    image,
    buttonText,
    buttonLink,
  });

  try {
    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error });
  }
};

// Update a banner
export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { title, description, image, buttonText, buttonLink } = req.body;

  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { title, description, image, buttonText, buttonLink },
      { new: true }
    );
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error });
  }
};

// Delete a banner
export const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    await Banner.findByIdAndDelete(id);
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error });
  }
};
