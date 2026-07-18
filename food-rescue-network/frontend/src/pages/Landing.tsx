import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import RescueRing from "../components/RescueRing";

const STEPS = [
  { title: "Post surplus food", text: "A restaurant, hotel, or bakery logs surplus food in under a minute — even by voice." },
  { title: "AI checks freshness", text: "Gemini Vision scores freshness and shelf life from a photo, setting a safe pickup deadline." },
  { title: "Best NGO gets matched", text: "Our matching engine ranks nearby NGOs by distance, capacity, and reliability." },
  { title: "Volunteer completes the loop", text: "A volunteer navigates, picks up, and confirms delivery with a QR scan." },
];

const FAQS = [
  { q: "How is food safety verified?", a: "Every donation gets an AI freshness score and a safe pickup deadline based on prep time and (optionally) a photo. NGOs and volunteers see this before accepting." },
  { q: "Is there a cost to join?", a: "No — the platform is free for restaurants, NGOs, and volunteers. It exists purely to reduce food waste and hunger." },
  { q: "What happens if no NGO accepts in time?", a: "Donations show an urgency badge that escalates as the safe pickup deadline approaches, prompting nearby NGOs and volunteers." },
];

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="eyebrow mb-4">Every 4 hours, a meal expires unclaimed</p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-forest font-semibold">
              Rescue food <span className="text-clay italic">before</span><br /> the clock runs out.
            </h1>
            <p className="mt-6 text-lg text-ink/70 max-w-lg">
              AI Food Rescue Network connects kitchens with surplus food to NGOs and volunteers nearby —
              matched, routed, and verified in minutes, not hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-gold">Start rescuing food</Link>
              <a href="#how-it-works" className="btn-outline">See how it works</a>
            </div>
            <div className="mt-10 flex gap-8 font-mono text-sm text-ink/60">
              <div><span className="text-2xl font-display text-forest block">12,480</span>meals rescued</div>
              <div><span className="text-2xl font-display text-forest block">6.2t</span>CO₂ saved</div>
              <div><span className="text-2xl font-display text-forest block">340+</span>partners</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="relative">
            <div className="card p-6 max-w-sm mx-auto">
              <p className="eyebrow mb-3">Live donation</p>
              <h3 className="font-display text-xl font-semibold text-forest">Vegetable Biryani · 25 servings</h3>
              <p className="text-sm text-ink/60 mt-1">Green Leaf Kitchen · 1.2 km away</p>
              <div className="flex items-center gap-4 mt-5">
                <RescueRing percent={82} label="fresh" size={90} />
                <div className="text-sm space-y-1.5">
                  <p><span className="font-semibold text-forest">Safe pickup:</span> next 2h 40m</p>
                  <p className="text-mint font-medium">✓ AI-matched to Anna Seva Foundation</p>
                  <p className="text-ink/50 font-mono text-xs">quality score: 84/100</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 card px-4 py-3 hidden sm:block">
              <p className="text-xs font-mono text-ink/50">volunteer en route</p>
              <p className="font-semibold text-forest text-sm">ETA 9 min 🚴</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-5 py-20">
        <p className="eyebrow text-center mb-3">The rescue loop</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest text-center font-semibold mb-14">
          From surplus to served, on the clock
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="card p-6 relative">
              <span className="font-display text-4xl text-gold/40 font-semibold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-semibold text-forest mt-3">{s.title}</h3>
              <p className="text-sm text-ink/60 mt-2">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="bg-forest text-paper py-20">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-3 gap-10 items-center">
          <div className="md:col-span-1">
            <p className="eyebrow mb-3 !text-gold">Real impact</p>
            <h2 className="font-display text-3xl font-semibold">Numbers that matter more than features</h2>
            <p className="text-paper/60 mt-4 text-sm">Live analytics power every dashboard — restaurants see meals saved, NGOs see distribution reach, volunteers see badges earned.</p>
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-3 gap-6">
            {[
              { label: "Meals rescued", value: "12,480" },
              { label: "Food rescued", value: "5,180 kg" },
              { label: "CO₂ emissions avoided", value: "6.2 tonnes" },
            ].map((s) => (
              <div key={s.label} className="border border-paper/15 rounded-3xl p-6 text-center">
                <p className="font-display text-3xl font-semibold text-gold">{s.value}</p>
                <p className="text-sm text-paper/60 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-20">
        <p className="eyebrow text-center mb-3">Questions</p>
        <h2 className="font-display text-3xl text-forest text-center font-semibold mb-10">Frequently asked</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <details key={f.q} className="card p-5 group">
              <summary className="font-display font-semibold text-forest cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-gold group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-ink/60 mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-5 pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-forest font-semibold">Ready to rescue your first meal?</h2>
        <p className="text-ink/60 mt-3">Join as a restaurant, NGO, or volunteer — it takes under two minutes.</p>
        <Link to="/register" className="btn-gold mt-7 inline-flex">Create your account</Link>
      </section>
    </div>
  );
}
