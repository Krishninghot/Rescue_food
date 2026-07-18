import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["restaurant", "ngo", "volunteer", "admin"],
      required: true,
    },
    phone: { type: String, default: "" },
    orgName: { type: String, default: "" },
    address: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    capacity: { type: Number, default: 0 },
    avatarUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    stats: {
      mealsDonated: { type: Number, default: 0 },
      kgRescued: { type: Number, default: 0 },
      co2SavedKg: { type: Number, default: 0 },
      pickupsCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
