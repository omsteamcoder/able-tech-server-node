import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import Product from "../models/productModel.js";
import Blog from "../models/blogModel.js";
import Page from "../models/pageModel.js";
import User from "../models/userModel.js"; // Assuming you have a User model for "Total Users"

// NOTE: Make sure your Mongoose models include a 'createdAt' timestamp for sorting.

/**
 * @desc Get aggregated statistics for the dashboard.
 * @route GET /api/dashboard/stats
 * @access Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Use Promise.all to run all count queries concurrently for efficiency
    const [
      categoryCount,
      subcategoryCount,
      productCount,
      blogCount,
      pageCount,
      userCount,
    ] = await Promise.all([
      Category.countDocuments(),
      Subcategory.countDocuments(),
      Product.countDocuments(),
      Blog.countDocuments(),
      Page.countDocuments(),
      User.countDocuments(),
      // Add other count queries here, e.g., Order.countDocuments()
    ]);

    // Construct the response object
    const stats = {
      totalCategories: categoryCount,
      totalSubcategories: subcategoryCount,
      totalProducts: productCount,
      totalBlogs: blogCount,
      totalPages: pageCount,
      totalUsers: userCount,
      // Add other aggregate stats here if needed
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch dashboard statistics",
        error: error.message,
      });
  }
};

/**
 * @desc Get the most recent activities (e.g., latest products, blogs, users).
 * @route GET /api/dashboard/recent-activities
 * @access Private/Admin
 * @queryParams limit (optional, defaults to 10)
 */
export const getRecentActivities = async (req, res) => {
  try {
    // Determine the limit, defaulting to 10 if not specified
    const limitPerCategory = parseInt(req.query.limit) || 10;

    // Fetch the latest items from key models concurrently
    const [recentProducts, recentBlogs, recentUsers] = await Promise.all([
      // Fetch latest products, sorting by creation date descending
      Product.find()
        .sort({ createdAt: -1 })
        .limit(limitPerCategory)
        .select("name createdAt"),
      // Fetch latest blog posts
      Blog.find()
        .sort({ createdAt: -1 })
        .limit(limitPerCategory)
        .select("title createdAt"),
      // Fetch latest users
      User.find()
        .sort({ createdAt: -1 })
        .limit(limitPerCategory)
        .select("username email createdAt"),
      // Add more recent activity fetches here (e.g., Order, Page updates)
    ]);

    // 1. Map and standardize the data structure for each model
    let activities = [];

    recentProducts.forEach((p) =>
      activities.push({
        type: "Product Added",
        name: p.name,
        date: p.createdAt,
        linkId: p._id, // ID for routing to the detail page
      })
    );

    recentBlogs.forEach((b) =>
      activities.push({
        type: "New Blog Post",
        name: b.title,
        date: b.createdAt,
        linkId: b._id,
      })
    );

    recentUsers.forEach((u) =>
      activities.push({
        type: "New User Registered",
        // Use username if available, otherwise fallback to email
        name: u.username || u.email,
        date: u.createdAt,
        linkId: u._id,
      })
    );

    // 2. Sort all activities into a single chronological list (newest first)
    activities.sort((a, b) => b.date - a.date);

    // 3. Return the top N activities from the combined list (default 10)
    // Note: We use the limit from the query parameter to restrict the final output size.
    res.status(200).json(activities.slice(0, limitPerCategory));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch recent activities",
        error: error.message,
      });
  }
};
