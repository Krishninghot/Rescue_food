import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { listUsers, verifyUser, suspendUser, listAllDonations } from "../controllers/adminController.js";

const router = express.Router();
router.use(protect, authorize("admin"));
router.get("/users", listUsers);
router.patch("/users/:id/verify", verifyUser);
router.patch("/users/:id/suspend", suspendUser);
router.get("/donations", listAllDonations);

export default router;
