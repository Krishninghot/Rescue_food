import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const DASH: Record<string, string> = {
  restaurant: "/restaurant", ngo: "/ngo", volunteer: "/volunteer", admin: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
      navigate(DASH[user.role] || "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">Sign in</h1>
      <form onSubmit={onSubmit} className="card p-7 space-y-4">
        {error && <p className="text-clay text-sm bg-clay/10 rounded-xl px-3 py-2">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
        <p className="text-sm text-ink/60 text-center">
          No account? <Link to="/register" className="text-forest font-semibold hover:underline">Register</Link>
        </p>
        <div className="text-xs text-ink/40 font-mono text-center pt-2 border-t border-forest/10">
          demo: restaurant@rescue.ai / ngo@rescue.ai / volunteer@rescue.ai / admin@rescue.ai — password123
        </div>
      </form>
    </div>
  );
}
