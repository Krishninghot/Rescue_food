import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const DASH: Record<string, string> = {
  restaurant: "/restaurant", ngo: "/ngo", volunteer: "/volunteer", admin: "/admin",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-md border-b border-forest/10">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-forest text-lg">
          <span className="w-8 h-8 rounded-full bg-forest text-gold flex items-center justify-center text-sm">🌾</span>
          Food Rescue Network
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/70">
          <a href="/#how-it-works" className="hover:text-forest transition">How it works</a>
          <a href="/#impact" className="hover:text-forest transition">Impact</a>
          <a href="/#faq" className="hover:text-forest transition">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={DASH[user.role]} className="btn-outline !px-4 !py-2 text-sm">Dashboard</Link>
              <button onClick={() => { logout(); navigate("/"); }} className="text-sm text-ink/60 hover:text-clay transition">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-forest transition">Sign in</Link>
              <Link to="/register" className="btn-primary !px-5 !py-2 text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
