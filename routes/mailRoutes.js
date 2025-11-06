import express from "express";
import { mailer } from "../controllers/mailController.js";

const router = express.Router();

router.post("/", mailer);

export default router;