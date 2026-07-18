import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["restaurant", "ngo", "volunteer"], required: true },
    scores: {
      // restaurant: foodQuality, packaging, hygiene, accuracy
      // ngo: communication, distribution, professionalism
      // volunteer: behavior, timeliness, foodHandling
      type: Map,
      of: Number,
    },
    overall: { type: Number, required: true },
    review: { type: String, default: "" },
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Rating", ratingSchema);
