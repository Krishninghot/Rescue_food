import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import DonationCard from "../components/DonationCard";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import MapView, { MapPoint } from "../components/MapView";

export default function NGODashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [d, o] = await Promise.all([api.get("/donations/nearby"), api.get("/analytics/overview")]);
    setResults(d.data.results);
    setOverview(o.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function accept(id: string) {
    try {
      await api.patch(`/donations/${id}/accept`);
      toast("Donation accepted — a volunteer will be matched next.", "success");
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || "Could not accept donation", "error");
    }
  }

  if (loading) return <Loader label="Finding nearby donations..." />;

  const center: [number, number] = user
    ? [user.location.coordinates[1] || 18.5204, user.location.coordinates[0] || 73.8567]
    : [18.5204, 73.8567];

  const points: MapPoint[] = results.map((r) => ({
    id: r.donation._id, lat: r.donation.location.coordinates[1], lng: r.donation.location.coordinates[0],
    label: r.donation.foodName, detail: `${r.distanceKm} km away · match score ${r.matchScore}`,
  }));

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="eyebrow mb-1">NGO dashboard</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">{user?.orgName || user?.name}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="🍽️" label="Meals distributed" value={overview?.mealsDonated ?? 0} />
        <StatCard icon="⚖️" label="Food rescued (kg)" value={overview?.kgRescued ?? 0} />
        <StatCard icon="📦" label="Active pickups" value={overview?.activeDonations ?? 0} />
        <StatCard icon="⭐" label="Reputation score" value={user?.ratingAvg ?? 0} sub={`${user?.ratingCount ?? 0} reviews`} />
      </div>

      <h2 className="font-display text-xl font-semibold text-forest mb-4">Nearby donations map</h2>
      <MapView center={center} points={points} radiusKm={15} />

      <h2 className="font-display text-xl font-semibold text-forest mt-10 mb-4">
        AI-ranked matches ({results.length})
      </h2>
      <div className="grid gap-4">
        {results.length === 0 && <p className="text-ink/50 text-sm">No pending donations nearby right now.</p>}
        {results.map(({ donation, matchScore, distanceKm }) => (
          <div key={donation._id}>
            <DonationCard donation={donation} actions={
              <>
                <span className="text-xs font-mono bg-gold/15 text-gold-dark px-2.5 py-1 rounded-full">match score {matchScore}</span>
                <span className="text-xs font-mono bg-forest/10 text-forest px-2.5 py-1 rounded-full">{distanceKm} km away</span>
                <button onClick={() => accept(donation._id)} className="btn-primary !px-4 !py-1.5 text-sm ml-auto">Accept donation</button>
              </>
            } />
          </div>
        ))}
      </div>
    </div>
  );
}
