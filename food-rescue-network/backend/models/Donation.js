import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodName: { type: String, required: true },
    category: { type: String, required: true }, // e.g. Cooked Meal, Bakery, Produce, Packaged
    dietType: { type: String, enum: ["veg", "non-veg", "vegan"], required: true },
    quantity: { type: Number, required: true }, // number of servings
    quantityUnit: { type: String, default: "servings" },
    weightKg: { type: Number, default: 0 },
    preparedAt: { type: Date, required: true },
    expiryEstimate: { type: Date, required: true },
    pickupAddress: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    instructions: { type: String, default: "" },
    imageUrl: { type: String, default: "" },

    // AI analysis (Gemini Vision)
    ai: {
      freshnessPercent: { type: Number, default: null },
      qualityScore: { type: Number, default: null }, // 0-100
      predictedShelfLifeHours: { type: Number, default: null },
      safePickupDeadline: { type: Date, default: null },
      spoilageWarning: { type: String, default: "" },
      rawSummary: { type: String, default: "" },
    },

    urgency: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },

    status: {
      type: String,
      enum: [
        "pending",       // just created, awaiting NGO match/accept
        "matched",       // AI suggested / NGO assigned but not yet accepted
        "accepted",      // NGO accepted
        "volunteer_assigned",
        "picked_up",
        "delivered",
        "completed",
        "expired",
        "cancelled",
      ],
      default: "pending",
    },

    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    qrCode: { type: String, default: "" }, // data string encoded in QR for pickup/delivery verification
    pickupVerifiedAt: { type: Date, default: null },
    deliveryVerifiedAt: { type: Date, default: null },

    timeline: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

donationSchema.index({ location: "2dsphere" });
donationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Donation", donationSchema);
