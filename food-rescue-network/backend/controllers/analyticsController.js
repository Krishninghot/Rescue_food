import Donation from "../models/Donation.js";
import User from "../models/User.js";

// GET /api/analytics/overview  (any authenticated user — scoped by role)
export async function getOverview(req, res, next) {
  try {
    const match = {};
    if (req.user.role === "restaurant") match.restaurant = req.user._id;
    if (req.user.role === "ngo") match.ngo = req.user._id;
    if (req.user.role === "volunteer") match.volunteer = req.user._id;

    const completed = await Donation.find({ ...match, status: "completed" });
    const active = await Donation.countDocuments({ ...match, status: { $nin: ["completed", "cancelled", "expired"] } });

    const mealsDonated = completed.reduce((sum, d) => sum + d.quantity, 0);
    const kgRescued = completed.reduce((sum, d) => sum + (d.weightKg || d.quantity * 0.4), 0);
    const co2Saved = kgRescued * 2.5;

    // last 14 days trend
    const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const recent = await Donation.find({ ...match, createdAt: { $gte: since } }).select("createdAt quantity status");
    const byDay = {};
    recent.forEach((d) => {
      const day = d.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + d.quantity;
    });

    res.json({
      mealsDonated,
      kgRescued: Math.round(kgRescued),
      co2Saved: Math.round(co2Saved),
      activeDonations: active,
      completedDonations: completed.length,
      trend: Object.entries(byDay).map(([date, meals]) => ({ date, meals })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/platform  (admin) — heat map + leaderboards
export async function getPlatformAnalytics(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const byRole = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
    const totalDonations = await Donation.countDocuments();
    const completed = await Donation.find({ status: "completed" });

    const mealsDonated = completed.reduce((s, d) => s + d.quantity, 0);
    const kgRescued = completed.reduce((s, d) => s + (d.weightKg || d.quantity * 0.4), 0);

    const heatmapPoints = await Donation.find({}).select("location urgency status");

    const topDonors = await User.find({ role: "restaurant" }).sort({ "stats.mealsDonated": -1 }).limit(5).select("name orgName stats");
    const topNgos = await User.find({ role: "ngo" }).sort({ "stats.mealsDonated": -1 }).limit(5).select("name orgName stats");
    const topVolunteers = await User.find({ role: "volunteer" }).sort({ points: -1 }).limit(5).select("name points stats badges");

    res.json({
      totalUsers,
      byRole,
      totalDonations,
      mealsDonated,
      kgRescued: Math.round(kgRescued),
      co2Saved: Math.round(kgRescued * 2.5),
      heatmapPoints: heatmapPoints.map((d) => ({
        lat: d.location.coordinates[1],
        lng: d.location.coordinates[0],
        urgency: d.urgency,
        status: d.status,
      })),
      topDonors,
      topNgos,
      topVolunteers,
    });
  } catch (err) {
    next(err);
  }
}
