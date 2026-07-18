import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "donation_created",
        "donation_accepted",
        "volunteer_assigned",
        "picked_up",
        "delivered",
        "completed",
        "system",
      ],
      default: "system",
    },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
