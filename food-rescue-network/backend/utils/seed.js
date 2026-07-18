/**
 * Demo data seeder — creates one user per role plus a couple of sample
 * donations so the app is instantly demoable at a hackathon.
 * Run with: npm run seed
 */
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

dotenv.config();

async function seed() {
  await connectDB();
  console.log("Clearing existing demo collections...");
  await User.deleteMany({});
  await Donation.deleteMany({});

  const admin = await User.create({
    name: "Platform Admin", email: "admin@rescue.ai", password: "password123", role: "admin",
  });

  const restaurant = await User.create({
    name: "Priya Sharma", email: "restaurant@rescue.ai", password: "password123", role: "restaurant",
    orgName: "Green Leaf Kitchen", address: "MG Road, Pune", isVerified: true,
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
  });

  const ngo = await User.create({
    name: "Rahul Kulkarni", email: "ngo@rescue.ai", password: "password123", role: "ngo",
    orgName: "Anna Seva Foundation", address: "FC Road, Pune", isVerified: true, capacity: 50,
    location: { type: "Point", coordinates: [73.8480, 18.5314] },
  });

  const volunteer = await User.create({
    name: "Aditi Rao", email: "volunteer@rescue.ai", password: "password123", role: "volunteer",
    address: "Kothrud, Pune", points: 120, badges: ["Reliable Volunteer"],
    location: { type: "Point", coordinates: [73.8072, 18.5074] },
  });

  await Donation.create({
    restaurant: restaurant._id,
    foodName: "Vegetable Biryani (25 servings)",
    category: "Cooked Meal",
    dietType: "veg",
    quantity: 25,
    weightKg: 12,
    preparedAt: new Date(Date.now() - 1.5 * 3600 * 1000),
    expiryEstimate: new Date(Date.now() + 3 * 3600 * 1000),
    pickupAddress: "Green Leaf Kitchen, MG Road, Pune",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    urgency: "medium",
    ai: { freshnessPercent: 88, qualityScore: 84, predictedShelfLifeHours: 4, safePickupDeadline: new Date(Date.now() + 4 * 3600 * 1000), spoilageWarning: "", rawSummary: "Freshly prepared, good condition." },
    qrCode: uuid(),
    timeline: [{ status: "pending", note: "Donation posted" }],
  });

  console.log("✅ Seed complete. Demo logins (password123):");
  console.log("  admin@rescue.ai / restaurant@rescue.ai / ngo@rescue.ai / volunteer@rescue.ai");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
