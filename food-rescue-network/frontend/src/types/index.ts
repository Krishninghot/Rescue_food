export type Role = "restaurant" | "ngo" | "volunteer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  orgName?: string;
  address?: string;
  phone?: string;
  location: { type: string; coordinates: [number, number] };
  capacity?: number;
  isVerified: boolean;
  isSuspended?: boolean;
  points: number;
  badges: string[];
  ratingAvg: number;
  ratingCount: number;
  stats: {
    mealsDonated: number;
    kgRescued: number;
    co2SavedKg: number;
    pickupsCompleted: number;
  };
}

export interface AiAnalysis {
  freshnessPercent: number | null;
  qualityScore: number | null;
  predictedShelfLifeHours: number | null;
  safePickupDeadline: string | null;
  spoilageWarning: string;
  rawSummary: string;
}

export type DonationStatus =
  | "pending" | "matched" | "accepted" | "volunteer_assigned"
  | "picked_up" | "delivered" | "completed" | "expired" | "cancelled";

export interface Donation {
  _id: string;
  restaurant: any;
  ngo?: any;
  volunteer?: any;
  foodName: string;
  category: string;
  dietType: "veg" | "non-veg" | "vegan";
  quantity: number;
  quantityUnit: string;
  weightKg: number;
  preparedAt: string;
  expiryEstimate: string;
  pickupAddress: string;
  location: { type: string; coordinates: [number, number] };
  instructions?: string;
  imageUrl?: string;
  ai: AiAnalysis;
  urgency: "low" | "medium" | "high" | "critical";
  status: DonationStatus;
  qrCode: string;
  timeline: { status: string; note: string; at: string }[];
  createdAt: string;
}
