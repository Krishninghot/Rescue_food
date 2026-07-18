import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createDonation, getMyDonations, getNearbyDonations, acceptDonation,
  getAvailablePickups, assignVolunteer, verifyPickup, verifyDelivery,
  getDonationQr, getDonationById, cancelDonation,
} from "../controllers/donationController.js";

const router = express.Router();

router.post("/", protect, authorize("restaurant"), upload.single("image"), createDonation);
router.get("/mine", protect, authorize("restaurant"), getMyDonations);
router.get("/nearby", protect, authorize("ngo"), getNearbyDonations);
router.get("/available-for-volunteers", protect, authorize("volunteer"), getAvailablePickups);
router.patch("/:id/accept", protect, authorize("ngo"), acceptDonation);
router.patch("/:id/assign-volunteer", protect, authorize("volunteer"), assignVolunteer);
router.patch("/:id/verify-pickup", protect, authorize("volunteer"), verifyPickup);
router.patch("/:id/verify-delivery", protect, authorize("volunteer"), verifyDelivery);
router.patch("/:id/cancel", protect, authorize("restaurant"), cancelDonation);
router.get("/:id/qrcode", protect, getDonationQr);
router.get("/:id", protect, getDonationById);

export default router;
