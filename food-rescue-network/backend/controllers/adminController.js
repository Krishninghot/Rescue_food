import User from "../models/User.js";
import Donation from "../models/Donation.js";

export async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function verifyUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: req.body.suspend !== false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function listAllDonations(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const donations = await Donation.find(filter)
      .populate("restaurant", "name orgName")
      .populate("ngo", "name orgName")
      .populate("volunteer", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ donations });
  } catch (err) {
    next(err);
  }
}
