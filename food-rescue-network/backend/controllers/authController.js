import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, orgName, address, lat, lng, capacity } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      orgName,
      address,
      capacity: capacity || 0,
      location: {
        type: "Point",
        coordinates: [Number(lng) || 0, Number(lat) || 0],
      },
      isVerified: role === "restaurant" || role === "ngo" ? false : true,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isSuspended) return res.status(403).json({ message: "Account suspended, contact admin" });
    const token = generateToken(user._id, user.role);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

export async function updateProfile(req, res, next) {
  try {
    const fields = ["name", "phone", "orgName", "address", "avatarUrl", "capacity"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    if (req.body.lat && req.body.lng) {
      req.user.location = { type: "Point", coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}
