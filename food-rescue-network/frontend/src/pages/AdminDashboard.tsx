import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import MapView, { MapPoint } from "../components/MapView";

export default function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState<"overview" | "users" | "donations">("overview");
  const [platform, setPlatform] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  async function loadOverview() {
    const res = await api.get("/analytics/platform");
    setPlatform(res.data);
  }
  async function loadUsers() {
    const res = await api.get("/admin/users", { params: roleFilter ? { role: roleFilter } : {} });
    setUsers(res.data.users);
  }
  async function loadDonations() {
    const res = await api.get("/admin/donations");
    setDonations(res.data.donations);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverview(), loadUsers(), loadDonations()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (tab === "users") loadUsers(); }, [roleFilter]);

  async function verify(id: string) {
    await api.patch(`/admin/users/${id}/verify`);
    toast("User verified", "success");
    loadUsers();
  }
  async function suspend(id: string, suspend: boolean) {
    await api.patch(`/admin/users/${id}/suspend`, { suspend });
    toast(suspend ? "User suspended" : "User reinstated", "info");
    loadUsers();
  }

  if (loading) return <Loader label="Loading platform analytics..." />;

  const points: MapPoint[] = (platform?.heatmapPoints || []).map((p: any, i: number) => ({
    id: String(i), lat: p.lat, lng: p.lng, label: p.status, detail: `urgency: ${p.urgency}`,
  }));

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="eyebrow mb-1">Admin panel</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">Platform control center</h1>

      <div className="flex gap-2 mb-8 border-b border-forest/10">
        {(["overview", "users", "donations"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition ${tab === t ? "border-gold text-forest" : "border-transparent text-ink/50"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && platform && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon="👥" label="Total users" value={platform.totalUsers} />
            <StatCard icon="📦" label="Total donations" value={platform.totalDonations} />
            <StatCard icon="🍽️" label="Meals rescued" value={platform.mealsDonated} />
            <StatCard icon="🌍" label="CO₂ saved (kg)" value={platform.co2Saved} />
          </div>

          <h2 className="font-display text-xl font-semibold text-forest mb-4">Donation heat map</h2>
          <MapView center={[18.5204, 73.8567]} points={points} height={400} />

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { title: "Top donors", data: platform.topDonors, metric: (u: any) => `${u.stats.mealsDonated} meals` },
              { title: "Top NGOs", data: platform.topNgos, metric: (u: any) => `${u.stats.mealsDonated} meals` },
              { title: "Top volunteers", data: platform.topVolunteers, metric: (u: any) => `${u.points} pts` },
            ].map((col) => (
              <div key={col.title} className="card p-5">
                <p className="font-display font-semibold text-forest mb-3">{col.title}</p>
                <ol className="space-y-2 text-sm">
                  {col.data.map((u: any, i: number) => (
                    <li key={u._id} className="flex justify-between">
                      <span>{i + 1}. {u.orgName || u.name}</span>
                      <span className="font-mono text-gold-dark">{col.metric(u)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "users" && (
        <div>
          <div className="flex gap-2 mb-4">
            {["", "restaurant", "ngo", "volunteer", "admin"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`text-xs font-mono px-3 py-1.5 rounded-full border ${roleFilter === r ? "bg-forest text-paper border-forest" : "border-forest/20 text-ink/60"}`}>
                {r || "all"}
              </button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left">
                <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Verified</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-forest/5">
                    <td className="p-3">{u.orgName || u.name}<div className="text-xs text-ink/40">{u.email}</div></td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">{u.isVerified ? "✅" : "—"}</td>
                    <td className="p-3">{u.isSuspended ? <span className="text-clay">Suspended</span> : <span className="text-mint">Active</span>}</td>
                    <td className="p-3 space-x-2">
                      {!u.isVerified && (u.role === "restaurant" || u.role === "ngo") && (
                        <button onClick={() => verify(u._id)} className="text-forest font-semibold hover:underline">Verify</button>
                      )}
                      <button onClick={() => suspend(u._id, !u.isSuspended)} className="text-clay font-semibold hover:underline">
                        {u.isSuspended ? "Reinstate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "donations" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left">
              <tr><th className="p-3">Food</th><th className="p-3">Restaurant</th><th className="p-3">NGO</th><th className="p-3">Volunteer</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} className="border-t border-forest/5">
                  <td className="p-3">{d.foodName}</td>
                  <td className="p-3">{d.restaurant?.orgName || d.restaurant?.name}</td>
                  <td className="p-3">{d.ngo?.orgName || "—"}</td>
                  <td className="p-3">{d.volunteer?.name || "—"}</td>
                  <td className="p-3 capitalize">{d.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
