// routes/authRoutes.js
import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { validateLogin } from '../middleware/validateLogin.js';
import { validateSignup } from '../middleware/validateSignup.js';

const router = express.Router();

// Signup route
router.post('/signup', validateSignup, registerUser);

// Login route
router.post('/login', validateLogin, loginUser);

export default router;
