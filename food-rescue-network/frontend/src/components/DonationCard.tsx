import { motion } from "framer-motion";
import { Donation } from "../types";
import RescueRing from "./RescueRing";
import UrgencyBadge from "./UrgencyBadge";

function timeLeftPercent(expiry: string, preparedAt: string) {
  const total = new Date(expiry).getTime() - new Date(preparedAt).getTime();
  const left = new Date(expiry).getTime() - Date.now();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (left / total) * 100));
}

export default function DonationCard({ donation, actions }: { donation: Donation; actions?: React.ReactNode }) {
  const pct = donation.ai?.freshnessPercent ?? timeLeftPercent(donation.expiryEstimate, donation.preparedAt);

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden flex flex-col sm:flex-row"
    >
      <div className="sm:w-40 h-40 sm:h-auto bg-mist shrink-0 relative">
        {donation.imageUrl ? (
          <img src={donation.imageUrl} alt={donation.foodName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>
        )}
        <span className="absolute top-2 left-2 bg-forest/90 text-paper text-[10px] font-mono uppercase px-2 py-0.5 rounded-full">
          {donation.dietType}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-forest leading-tight">{donation.foodName}</h3>
            <p className="text-sm text-ink/60">{donation.category} · {donation.quantity} {donation.quantityUnit}</p>
          </div>
          <UrgencyBadge urgency={donation.urgency} />
        </div>

        <p className="text-sm text-ink/70 line-clamp-1">📍 {donation.pickupAddress}</p>

        <div className="flex items-center gap-4 mt-1">
          <RescueRing percent={pct} label="fresh" size={64} />
          <div className="text-sm space-y-1">
            {donation.ai?.rawSummary && <p className="text-ink/60 italic">"{donation.ai.rawSummary}"</p>}
            {donation.ai?.spoilageWarning && <p className="text-clay font-semibold">⚠ {donation.ai.spoilageWarning}</p>}
            <p className="font-mono text-xs text-ink/50">status: {donation.status.replace("_", " ")}</p>
          </div>
        </div>

        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}
