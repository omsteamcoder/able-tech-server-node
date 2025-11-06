// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load env variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// =======================
// Import Routes
// =======================
import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import clientLogoRoutes from "./routes/clientLogoRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import sectionOneRoutes from "./routes/sectionOneRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import mailRoutes from "./routes/mailRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import { debugFormData } from "./middleware/debugMiddleware.js";
// =======================
// Routes Middleware
// =======================

app.use(debugFormData);
// Auth
app.use("/api/auth", authRoutes);

// Pages & Menu
app.use("/api", pageRoutes);
app.use("/api/menu", menuRoutes);

// Home & Categories
app.use("/api/home", homeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productRoutes);

// Media (sliders, logos, gallery, uploads)
app.use("/api/slider", sliderRoutes);
app.use("/api/client-logo", clientLogoRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api", fileRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/dashboard",dashboardRoutes);
// Sections
app.use("/api/section-one", sectionOneRoutes);

// Blogs
app.use("/api/blog", blogRoutes);

// =======================
// Static Files
// =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Health Check Route
// =======================
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =======================
// Start Server
// =======================
const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
