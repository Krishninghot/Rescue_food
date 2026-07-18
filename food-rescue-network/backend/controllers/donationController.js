import fs from "fs";
import QRCode from "qrcode";
import { v4 as uuid } from "uuid";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { analyzeFoodImage, scoreNgoMatch } from "../utils/gemini.js";

const CO2_PER_KG_FOOD_WASTE = 2.5; // kg CO2e saved per kg food rescued (industry rough estimate)

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function notify(userId, title, message, type, donationId) {
  await Notification.create({ user: userId, title, message, type, donation: donationId });
}

// POST /api/donations  (restaurant)
export async function createDonation(req, res, next) {
  try {
    const {
      foodName, category, dietType, quantity, quantityUnit, weightKg,
      preparedAt, expiryEstimate, pickupAddress, instructions, lat, lng,
    } = req.body;

    if (!foodName || !category || !dietType || !quantity || !preparedAt || !expiryEstimate || !pickupAddress) {
      return res.status(400).json({ message: "Missing required donation fields" });
    }

    let imageUrl = "";
    let imageBase64 = null;
    let mimeType = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      imageBase64 = fs.readFileSync(req.file.path).toString("base64");
      mimeType = req.file.mimetype;
    }

    const aiResult = await analyzeFoodImage({ imageBase64, mimeType, foodName, preparedAt });
    const safePickupDeadline = new Date(
      Date.now() + (aiResult.predictedShelfLifeHours || 4) * 3600 * 1000
    );

    const hoursToExpiry = (new Date(expiryEstimate) - Date.now()) / 36e5;
    let urgency = "low";
    if (hoursToExpiry < 1) urgency = "critical";
    else if (hoursToExpiry < 3) urgency = "high";
    else if (hoursToExpiry < 6) urgency = "medium";

    const donation = await Donation.create({
      restaurant: req.user._id,
      foodName,
      category,
      dietType,
      quantity,
      quantityUnit: quantityUnit || "servings",
      weightKg: weightKg || 0,
      preparedAt,
      expiryEstimate,
      pickupAddress,
      location: { type: "Point", coordinates: [Number(lng) || req.user.location.coordinates[0], Number(lat) || req.user.location.coordinates[1]] },
      instructions,
      imageUrl,
      urgency,
      ai: {
        freshnessPercent: aiResult.freshnessPercent,
        qualityScore: aiResult.qualityScore,
        predictedShelfLifeHours: aiResult.predictedShelfLifeHours,
        safePickupDeadline,
        spoilageWarning: aiResult.spoilageWarning,
        rawSummary: aiResult.summary,
      },
      qrCode: uuid(),
      timeline: [{ status: "pending", note: "Donation posted" }],
    });

    res.status(201).json({ donation });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/mine  (restaurant)
export async function getMyDonations(req, res, next) {
  try {
    const donations = await Donation.find({ restaurant: req.user._id })
      .populate("ngo", "name orgName")
      .populate("volunteer", "name")
      .sort({ createdAt: -1 });
    res.json({ donations });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/nearby?lat=&lng=&radiusKm=  (ngo) — includes AI match score
export async function getNearbyDonations(req, res, next) {
  try {
    const { lat, lng, radiusKm = 15 } = req.query;
    const coords = [Number(lng) || req.user.location.coordinates[0], Number(lat) || req.user.location.coordinates[1]];

    const donations = await Donation.find({
      status: { $in: ["pending", "matched"] },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: Number(radiusKm) * 1000,
        },
      },
    }).populate("restaurant", "name orgName address isVerified ratingAvg");

    const ranked = donations
      .map((d) => {
        const distanceKm = haversineKm(coords, d.location.coordinates);
        const score = scoreNgoMatch({ ngo: req.user, donation: d, distanceKm });
        return { donation: d, distanceKm: Math.round(distanceKm * 10) / 10, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ results: ranked });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/accept  (ngo)
export async function acceptDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "pending" && donation.status !== "matched") {
      return res.status(400).json({ message: "Donation already accepted or unavailable" });
    }
    donation.ngo = req.user._id;
    donation.status = "accepted";
    donation.timeline.push({ status: "accepted", note: `Accepted by ${req.user.orgName || req.user.name}` });
    await donation.save();

    await notify(donation.restaurant, "Donation accepted!", `${req.user.orgName || req.user.name} accepted your donation "${donation.foodName}".`, "donation_accepted", donation._id);

    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/available-for-volunteers  (volunteer)
export async function getAvailablePickups(req, res, next) {
  try {
    const donations = await Donation.find({ status: "accepted" })
      .populate("restaurant", "name orgName address location")
      .populate("ngo", "name orgName address location")
      .sort({ urgency: -1, createdAt: 1 });
    res.json({ donations });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/assign-volunteer  (volunteer self-assigns)
export async function assignVolunteer(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "accepted") {
      return res.status(400).json({ message: "Donation is not ready for volunteer assignment" });
    }
    donation.volunteer = req.user._id;
    donation.status = "volunteer_assigned";
    donation.timeline.push({ status: "volunteer_assigned", note: `${req.user.name} assigned as volunteer` });
    await donation.save();

    await notify(donation.restaurant, "Volunteer assigned", `${req.user.name} will pick up "${donation.foodName}".`, "volunteer_assigned", donation._id);
    if (donation.ngo) await notify(donation.ngo, "Volunteer assigned", `${req.user.name} will handle pickup & delivery for "${donation.foodName}".`, "volunteer_assigned", donation._id);

    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/verify-pickup  { code }  (volunteer scans QR at restaurant)
export async function verifyPickup(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (String(donation.volunteer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You are not assigned to this pickup" });
    }
    if (req.body.code !== donation.qrCode) {
      return res.status(400).json({ message: "QR code does not match this donation" });
    }
    donation.status = "picked_up";
    donation.pickupVerifiedAt = new Date();
    donation.timeline.push({ status: "picked_up", note: "Pickup verified via QR code" });
    await donation.save();

    await notify(donation.restaurant, "Food picked up", `Your donation "${donation.foodName}" was picked up.`, "picked_up", donation._id);

    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/verify-delivery  { code }  (volunteer scans QR at NGO)
export async function verifyDelivery(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id).populate("restaurant volunteer ngo");
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (String(donation.volunteer._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You are not assigned to this delivery" });
    }
    if (req.body.code !== donation.qrCode) {
      return res.status(400).json({ message: "QR code does not match this donation" });
    }
    donation.status = "delivered";
    donation.deliveryVerifiedAt = new Date();
    donation.timeline.push({ status: "delivered", note: "Delivery verified via QR code" });
    await donation.save();

    // Finalize impact stats once delivered
    const weightKg = donation.weightKg || donation.quantity * 0.4; // rough estimate if weight not given
    const co2Saved = weightKg * CO2_PER_KG_FOOD_WASTE;

    await User.findByIdAndUpdate(donation.restaurant._id, {
      $inc: { "stats.mealsDonated": donation.quantity, "stats.kgRescued": weightKg, "stats.co2SavedKg": co2Saved },
    });
    await User.findByIdAndUpdate(donation.volunteer._id, {
      $inc: { points: 20, "stats.pickupsCompleted": 1 },
    });
    if (donation.ngo) {
      await User.findByIdAndUpdate(donation.ngo._id, {
        $inc: { "stats.mealsDonated": donation.quantity, "stats.kgRescued": weightKg },
      });
    }

    donation.status = "completed";
    donation.timeline.push({ status: "completed", note: "Donation cycle completed" });
    await donation.save();

    await notify(donation.restaurant._id, "Donation completed", `"${donation.foodName}" was delivered successfully. Thank you!`, "completed", donation._id);
    if (donation.ngo) await notify(donation.ngo._id, "Donation completed", `"${donation.foodName}" was delivered successfully.`, "completed", donation._id);

    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/:id/qrcode  — returns a QR code image (data URL) for the donation
export async function getDonationQr(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    const dataUrl = await QRCode.toDataURL(donation.qrCode);
    res.json({ qr: dataUrl, code: donation.qrCode });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/:id
export async function getDonationById(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("restaurant", "name orgName address ratingAvg")
      .populate("ngo", "name orgName")
      .populate("volunteer", "name phone");
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/cancel  (restaurant)
export async function cancelDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (String(donation.restaurant) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your donation" });
    }
    donation.status = "cancelled";
    donation.timeline.push({ status: "cancelled", note: "Cancelled by restaurant" });
    await donation.save();
    res.json({ donation });
  } catch (err) {
    next(err);
  }
}
