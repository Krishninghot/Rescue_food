import express from "express";
import { protect } from "../middleware/auth.js";
import { createRating, getUserRatings } from "../controllers/ratingController.js";

const router = express.Router();
router.post("/", protect, createRating);
router.get("/user/:id", protect, getUserRatings);

export default router;
