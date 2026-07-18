/**
 * Signature visual element: a circular "rescue ring" that doubles as a
 * freshness/urgency gauge everywhere a donation is shown — on cards,
 * the create-donation AI result, and pickup details. The ring closes
 * as food ages, giving an instant read on how urgent a pickup is.
 */
interface Props {
  percent: number; // 0-100, freshness or time-remaining percent
  label?: string;
  size?: number;
  colorClass?: string;
}

export default function RescueRing({ percent, label, size = 96, colorClass }: Props) {
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    colorClass ||
    (clamped > 66 ? "stroke-mint" : clamped > 33 ? "stroke-gold" : "stroke-clay");

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-forest/10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke}
          className={`${color} transition-all duration-700 ease-out`}
          fill="none" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold text-forest" style={{ fontSize: size * 0.24 }}>
          {Math.round(clamped)}%
        </span>
        {label && <span className="text-[10px] uppercase tracking-wide text-ink/50 font-mono">{label}</span>}
      </div>
    </div>
  );
}
