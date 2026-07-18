import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getOverview, getPlatformAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();
router.get("/overview", protect, getOverview);
router.get("/platform", protect, authorize("admin"), getPlatformAnalytics);

export default router;
