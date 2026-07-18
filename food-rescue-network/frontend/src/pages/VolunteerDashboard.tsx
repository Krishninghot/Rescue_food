import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import DonationCard from "../components/DonationCard";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const BADGE_ICON: Record<string, string> = {
  "Top Donor": "🏆", "Community Hero": "❤️", "Trusted Restaurant": "✅",
  "Verified NGO": "🛡️", "Reliable Volunteer": "🚴", "Food Rescue Champion": "🌟",
};

export default function VolunteerDashboard() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await api.get("/donations/available-for-volunteers");
    setDonations(res.data.donations);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function claim(id: string) {
    await api.patch(`/donations/${id}/assign-volunteer`);
    toast("Pickup claimed — navigate to the restaurant to collect it.", "success");
    load();
  }

  async function verifyPickup(id: string) {
    try {
      await api.patch(`/donations/${id}/verify-pickup`, { code: codeInputs[id] || "" });
      toast("Pickup verified!", "success");
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || "Invalid code", "error");
    }
  }

  async function verifyDelivery(id: string) {
    try {
      await api.patch(`/donations/${id}/verify-delivery`, { code: codeInputs[id] || "" });
      toast("Delivery verified — points added! 🎉", "success");
      refreshUser();
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || "Invalid code", "error");
    }
  }

  if (loading) return <Loader label="Finding pickups near you..." />;

  const mine = donations.filter((d) => d.volunteer?._id === user?._id || d.volunteer === user?._id);
  const available = donations.filter((d) => !d.volunteer);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="eyebrow mb-1">Volunteer dashboard</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">{user?.name}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="⭐" label="Points earned" value={user?.points ?? 0} />
        <StatCard icon="✅" label="Pickups completed" value={user?.stats.pickupsCompleted ?? 0} />
        <StatCard icon="📦" label="Available pickups" value={available.length} />
        <StatCard icon="🏅" label="Badges" value={user?.badges.length ?? 0} />
      </div>

      {!!user?.badges.length && (
        <div className="flex flex-wrap gap-2 mb-10">
          {user.badges.map((b) => (
            <span key={b} className="bg-gold/15 text-gold-dark px-3 py-1.5 rounded-full text-sm font-medium">
              {BADGE_ICON[b] || "🏅"} {b}
            </span>
          ))}
        </div>
      )}

      {mine.length > 0 && (
        <>
          <h2 className="font-display text-xl font-semibold text-forest mb-4">Your assigned pickups</h2>
          <div className="grid gap-4 mb-10">
            {mine.map((d) => (
              <DonationCard key={d._id} donation={d} actions={
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <input
                    className="input !py-1.5 text-sm max-w-[160px]" placeholder="Scan/enter QR code"
                    value={codeInputs[d._id] || ""} onChange={(e) => setCodeInputs((c) => ({ ...c, [d._id]: e.target.value }))}
                  />
                  {d.status === "volunteer_assigned" && (
                    <button onClick={() => verifyPickup(d._id)} className="btn-primary !px-4 !py-1.5 text-sm">Verify pickup</button>
                  )}
                  {d.status === "picked_up" && (
                    <button onClick={() => verifyDelivery(d._id)} className="btn-gold !px-4 !py-1.5 text-sm">Verify delivery</button>
                  )}
                </div>
              } />
            ))}
          </div>
        </>
      )}

      <h2 className="font-display text-xl font-semibold text-forest mb-4">Available pickups</h2>
      <div className="grid gap-4">
        {available.length === 0 && <p className="text-ink/50 text-sm">No unclaimed pickups right now — check back soon.</p>}
        {available.map((d) => (
          <DonationCard key={d._id} donation={d} actions={
            <button onClick={() => claim(d._id)} className="btn-primary !px-4 !py-1.5 text-sm">Claim this pickup</button>
          } />
        ))}
      </div>
    </div>
  );
}
