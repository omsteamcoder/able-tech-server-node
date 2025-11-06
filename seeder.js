import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import {
  Banner,
  ProductSection,
  SingleSection,
  Feedback,
  AdminProductHighlight,
} from "./models/HomeModel.js"; // adjust path if needed

import { productData, categoryData, bannerData, sectionOneData,productSectionData, singleSectionData, feedbackData, adminProductHighlightData } from "./staticData.js";

// Import your Product + Category models
import Product from "./models/pageModel.js";     // if Product is stored here
import Category from "./models/cagegoryModel.js";
import User from "./models/userModel.js";
import SectionOne from "./models/sectionOneModel.js";

dotenv.config();

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected for seeding..."))
  .catch((err) => console.error(err));

const seedDatabase = async () => {
  try {
    // // Clear collections
    // await Banner.deleteMany();
    // await ProductSection.deleteMany();
    // await SingleSection.deleteMany();
    // await Feedback.deleteMany();
    // await AdminProductHighlight.deleteMany();
    // await Product.deleteMany();
    // await Category.deleteMany();

    // console.log("✅ Old data removed");

    // // Insert categories first
    // await Category.insertMany(categoryData);
    // console.log("✅ Categories seeded");

    // // Insert products
    // await Product.insertMany(productData);
    // console.log("✅ Products seeded");

    // // Insert Banner
    // await Banner.create(bannerData);
    // console.log("✅ Banner seeded");

    // // Insert ProductSection (with product references)
    // await ProductSection.insertMany(productSectionData);
    // console.log("✅ Product Sections seeded");

    // // Insert SingleSection
    // await SingleSection.create(singleSectionData);
    // console.log("✅ Single Section seeded");

    // // Insert Feedback
    // await Feedback.insertMany(feedbackData);
    // console.log("✅ Feedback seeded");
    // Clear old section one
    await SectionOne.deleteMany();
    console.log("✅ SectionOne cleared");

    // Insert SectionOne data
    await SectionOne.insertMany(sectionOneData);
    console.log("✅ SectionOne seeded");


    // // Insert AdminProductHighlight
    // await AdminProductHighlight.insertMany(adminProductHighlightData);
    // console.log("✅ Admin Product Highlight seeded");

    //     // Insert admin user
    // await User.create({
    // name: "Super Admin",
    // email: "globe@hostupto.com",
    // password: "eurohost@4488",  // plain text, hook will hash
    // role: "admin",
    // });

    // console.log("✅ Admin user seeded: globe@hostupto.com / eurohost@4488");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
