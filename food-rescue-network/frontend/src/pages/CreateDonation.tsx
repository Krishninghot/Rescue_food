import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import RescueRing from "../components/RescueRing";

const CATEGORIES = ["Cooked Meal", "Bakery", "Produce", "Packaged Food", "Dairy", "Beverages"];

export default function CreateDonation() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    foodName: "", category: "Cooked Meal", dietType: "veg", quantity: "10", weightKg: "",
    preparedAt: new Date().toISOString().slice(0, 16),
    expiryEstimate: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
    pickupAddress: "", instructions: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  }

  // AI Voice Posting — Web Speech API -> backend parser
  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Voice input isn't supported in this browser — try Chrome.", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setVoiceLoading(true);
    recognition.start();
    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      try {
        const res = await api.post("/ai/voice-donation", { transcript });
        const p = res.data.parsed;
        setForm((f) => ({ ...f, foodName: p.foodName, quantity: String(p.quantity), dietType: p.dietType, category: p.category }));
        toast(`Heard: "${transcript}"`, "success");
      } finally {
        setVoiceLoading(false);
      }
    };
    recognition.onerror = () => setVoiceLoading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const res = await api.post("/donations", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAiPreview(res.data.donation.ai);
      toast("Donation posted — AI has analyzed it and NGOs nearby are notified.", "success");
      setTimeout(() => navigate("/restaurant"), 1600);
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to post donation", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="eyebrow mb-2">New donation</p>
      <h1 className="font-display text-3xl font-semibold text-forest mb-2">Post surplus food</h1>
      <p className="text-ink/60 mb-8">Our AI will analyze freshness from your photo and set a safe pickup deadline automatically.</p>

      {aiPreview ? (
        <div className="card p-8 text-center">
          <p className="eyebrow mb-4">AI analysis complete</p>
          <RescueRing percent={aiPreview.freshnessPercent} label="freshness" size={120} />
          <p className="mt-4 font-display text-xl text-forest font-semibold">Quality score: {aiPreview.qualityScore}/100</p>
          <p className="text-ink/60 mt-1 italic">"{aiPreview.rawSummary}"</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card p-7 space-y-5">
          <div className="flex items-center justify-between">
            <label className="label !mb-0">Food photo (optional — powers AI freshness scoring)</label>
            <button type="button" onClick={startVoice} className="text-xs font-mono px-3 py-1.5 rounded-full border border-forest/20 hover:bg-forest hover:text-paper transition">
              {voiceLoading ? "🎙️ Listening..." : "🎙️ Voice post"}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-24 h-24 rounded-2xl bg-mist border-2 border-dashed border-forest/20 flex items-center justify-center cursor-pointer overflow-hidden shrink-0">
              {preview ? <img src={preview} className="w-full h-full object-cover" /> : <span className="text-2xl">📷</span>}
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
            <p className="text-xs text-ink/50">JPEG, PNG, or WEBP · up to 5MB</p>
          </div>

          <div>
            <label className="label">Food name</label>
            <input className="input" required value={form.foodName} onChange={(e) => update("foodName", e.target.value)} placeholder="e.g. Vegetable Biryani" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Diet type</label>
              <select className="input" value={form.dietType} onChange={(e) => update("dietType", e.target.value)}>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity (servings)</label>
              <input className="input" type="number" min={1} required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
            </div>
            <div>
              <label className="label">Weight (kg, optional)</label>
              <input className="input" type="number" min={0} value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prepared at</label>
              <input className="input" type="datetime-local" required value={form.preparedAt} onChange={(e) => update("preparedAt", e.target.value)} />
            </div>
            <div>
              <label className="label">Expiry estimate</label>
              <input className="input" type="datetime-local" required value={form.expiryEstimate} onChange={(e) => update("expiryEstimate", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Pickup address</label>
            <input className="input" required value={form.pickupAddress} onChange={(e) => update("pickupAddress", e.target.value)} />
          </div>

          <div>
            <label className="label">Special instructions (optional)</label>
            <textarea className="input" rows={2} value={form.instructions} onChange={(e) => update("instructions", e.target.value)} placeholder="e.g. Use rear entrance, ask for Priya" />
          </div>

          <button disabled={loading} className="btn-primary w-full">{loading ? "Analyzing with AI..." : "Post donation"}</button>
        </form>
      )}
    </div>
  );
}
