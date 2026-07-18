import Rating from "../models/Rating.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import { summarizeReviews } from "../utils/gemini.js";

// POST /api/ratings
export async function createRating(req, res, next) {
  try {
    const { donationId, ratedUserId, role, scores, review } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const values = Object.values(scores || {});
    const overall = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const rating = await Rating.create({
      donation: donationId,
      ratedBy: req.user._id,
      ratedUser: ratedUserId,
      role,
      scores,
      overall,
      review: review || "",
    });

    const target = await User.findById(ratedUserId);
    const newCount = target.ratingCount + 1;
    const newAvg = (target.ratingAvg * target.ratingCount + overall) / newCount;
    target.ratingAvg = Math.round(newAvg * 10) / 10;
    target.ratingCount = newCount;
    await target.save();

    res.status(201).json({ rating });
  } catch (err) {
    next(err);
  }
}

// GET /api/ratings/user/:id
export async function getUserRatings(req, res, next) {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.id }).sort({ createdAt: -1 }).limit(50);
    const reviews = ratings.map((r) => r.review).filter(Boolean);
    const aiSummary = await summarizeReviews(reviews.slice(0, 10));
    res.json({ ratings, aiSummary });
  } catch (err) {
    next(err);
  }
}
