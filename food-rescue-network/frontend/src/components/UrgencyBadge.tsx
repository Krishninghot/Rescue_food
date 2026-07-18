const STYLES: Record<string, string> = {
  low: "bg-mint/15 text-mint border-mint/30",
  medium: "bg-gold/15 text-gold-dark border-gold/30",
  high: "bg-clay-light/20 text-clay border-clay/30",
  critical: "bg-clay text-white border-clay animate-pulse",
};

export default function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={`text-xs font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border font-semibold ${STYLES[urgency] || STYLES.medium}`}>
      {urgency}
    </span>
  );
}
