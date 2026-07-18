import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DonationCard from "../components/DonationCard";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import { Donation } from "../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [d, o] = await Promise.all([api.get("/donations/mine"), api.get("/analytics/overview")]);
    setDonations(d.data.donations);
    setOverview(o.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    await api.patch(`/donations/${id}/cancel`);
    load();
  }

  if (loading) return <Loader label="Loading your dashboard..." />;

  const active = donations.filter((d) => !["completed", "cancelled", "expired"].includes(d.status));
  const past = donations.filter((d) => ["completed", "cancelled", "expired"].includes(d.status));

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-1">Restaurant dashboard</p>
          <h1 className="font-display text-3xl font-semibold text-forest">{user?.orgName || user?.name}</h1>
        </div>
        <Link to="/restaurant/new" className="btn-gold">+ Post surplus food</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="🍽️" label="Meals donated" value={overview?.mealsDonated ?? 0} />
        <StatCard icon="⚖️" label="Food rescued (kg)" value={overview?.kgRescued ?? 0} />
        <StatCard icon="🌍" label="CO₂ saved (kg)" value={overview?.co2Saved ?? 0} sub="vs. landfill" />
        <StatCard icon="📦" label="Active donations" value={overview?.activeDonations ?? 0} />
      </div>

      {overview?.trend?.length > 1 && (
        <div className="card p-6 mb-10">
          <p className="font-display font-semibold text-forest mb-4">Meals donated — last 14 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overview.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#12352415" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="meals" stroke="#E3A72E" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-forest mb-4">Active donations</h2>
      <div className="grid gap-4 mb-10">
        {active.length === 0 && <p className="text-ink/50 text-sm">Nothing active — post your first donation to get started.</p>}
        {active.map((d) => (
          <DonationCard key={d._id} donation={d} actions={
            d.status === "pending" ? <button onClick={() => cancel(d._id)} className="text-sm text-clay font-semibold hover:underline">Cancel</button> : undefined
          } />
        ))}
      </div>

      <h2 className="font-display text-xl font-semibold text-forest mb-4">History</h2>
      <div className="grid gap-4">
        {past.map((d) => <DonationCard key={d._id} donation={d} />)}
      </div>
    </div>
  );
}
