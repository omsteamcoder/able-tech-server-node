// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key

/**
 * Register User
 */
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user with plain password; password will be hashed by the pre-save hook
    const newUser = new userModel({
      name,
      email,
      password,
      role: role || "user",
    });

    await newUser.save();
    console.log("User registered successfully");

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Login User
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Attempting login for email:", email);

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Passwords do not match");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "10h" }
    );
        const safeUser = {
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.status(200).json({ msg: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
