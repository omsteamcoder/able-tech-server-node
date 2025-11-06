// routes/dashboardRoutes.js

import express from "express";
import { getDashboardStats,getRecentActivities } from "../controllers/dashboardController.js";


const router = express.Router();


router.get("/stats", getDashboardStats);
router.get("/recent-activities",getRecentActivities)
export default router;