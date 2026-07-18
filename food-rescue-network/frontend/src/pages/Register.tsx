import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Role } from "../types";

const ROLES: { key: Role; label: string; icon: string; desc: string }[] = [
  { key: "restaurant", label: "Restaurant / Hotel", icon: "🍽️", desc: "Post surplus food for pickup" },
  { key: "ngo", label: "NGO", icon: "🤝", desc: "Accept & distribute rescued food" },
  { key: "volunteer", label: "Volunteer", icon: "🚴", desc: "Pick up and deliver donations" },
];

const DASH: Record<string, string> = {
  restaurant: "/restaurant", ngo: "/ngo", volunteer: "/volunteer", admin: "/admin",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState<Role>("restaurant");
  const [form, setForm] = useState({ name: "", email: "", password: "", orgName: "", address: "", phone: "", capacity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await register({ ...form, role, lat: 18.5204, lng: 73.8567 });
      toast("Account created — welcome aboard!", "success");
      navigate(DASH[user.role] || "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <p className="eyebrow mb-2">Join the network</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">Create your account</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {ROLES.map((r) => (
          <button
            type="button" key={r.key} onClick={() => setRole(r.key)}
            className={`card p-4 text-center transition ${role === r.key ? "!border-gold ring-2 ring-gold/40" : ""}`}
          >
            <div className="text-2xl">{r.icon}</div>
            <p className="text-sm font-semibold text-forest mt-1">{r.label}</p>
            <p className="text-xs text-ink/50 mt-0.5 hidden sm:block">{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="card p-7 space-y-4">
        {error && <p className="text-clay text-sm bg-clay/10 rounded-xl px-3 py-2">{error}</p>}
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        {(role === "restaurant" || role === "ngo") && (
          <div>
            <label className="label">{role === "restaurant" ? "Restaurant / business name" : "Organization name"}</label>
            <input className="input" required value={form.orgName} onChange={(e) => update("orgName", e.target.value)} />
          </div>
        )}
        {role === "ngo" && (
          <div>
            <label className="label">Daily meal capacity</label>
            <input className="input" type="number" min={1} value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="e.g. 50" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, city" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Creating account..." : "Create account"}</button>
        <p className="text-sm text-ink/60 text-center">
          Already have an account? <Link to="/login" className="text-forest font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
