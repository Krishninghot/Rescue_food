import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function StatCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="card p-5 flex items-start gap-4"
    >
      <div className="w-11 h-11 rounded-2xl bg-forest text-gold flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-forest leading-tight">{value}</p>
        <p className="text-sm text-ink/60">{label}</p>
        {sub && <p className="text-xs text-mint font-mono mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}
