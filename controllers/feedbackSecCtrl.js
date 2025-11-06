import { Feedback } from "../models/HomeModel.js";


// Get all feedback
export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error });
  }
};

// Create new feedback
export const createFeedback = async (req, res) => {
  const { name, comment, image } = req.body;

  const newFeedback = new Feedback({
    name,
    comment,
    image,
  });

  try {
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Error creating feedback', error });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback', error });
  }
};
