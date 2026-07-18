export default function Footer() {
  return (
    <footer className="bg-forest text-paper/80 mt-24">
      <div className="max-w-7xl mx-auto px-5 py-14 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-xl text-paper font-semibold mb-2">🌾 Food Rescue Network</p>
          <p className="text-sm text-paper/60 max-w-xs">
            AI-matched surplus food rescue — connecting kitchens, NGOs, and volunteers before good food goes to waste.
          </p>
        </div>
        <div>
          <p className="font-semibold text-paper mb-2 text-sm uppercase tracking-wide font-mono">Platform</p>
          <ul className="space-y-1.5 text-sm text-paper/60">
            <li>How it works</li><li>Impact dashboard</li><li>For NGOs</li><li>For volunteers</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-2 text-sm uppercase tracking-wide font-mono">Contact</p>
          <ul className="space-y-1.5 text-sm text-paper/60">
            <li>hello@foodrescue.network</li><li>+91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 text-center text-xs text-paper/40 py-4">
        © {new Date().getFullYear()} AI Food Rescue Network. Built for good.
      </div>
    </footer>
  );
}
