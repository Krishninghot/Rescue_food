import express from "express";
import { protect } from "../middleware/auth.js";
import { chat, parseVoiceDonation } from "../controllers/aiController.js";

const router = express.Router();
router.post("/chat", protect, chat);
router.post("/voice-donation", protect, parseVoiceDonation);

export default router;
