/**
 * Thin wrapper around the Gemini API.
 * If GEMINI_API_KEY is not set, every function falls back to a deterministic
 * mock so the whole app (and the hackathon demo) still works offline.
 */
const GEMINI_MODEL = "gemini-2.0-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(parts) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null; // caller should fall back to mock

  const res = await fetch(`${BASE_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function tryParseJSON(text) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/** AI Food Freshness Detection (Gemini Vision) */
export async function analyzeFoodImage({ imageBase64, mimeType, foodName, preparedAt }) {
  const hoursSincePrep = preparedAt ? (Date.now() - new Date(preparedAt).getTime()) / 36e5 : 1;

  const prompt = `You are a food safety inspector for a food-rescue platform.
Food name: ${foodName}. Hours since preparation: ${hoursSincePrep.toFixed(1)}.
Look at the attached image and respond with ONLY a JSON object, no prose, in this exact shape:
{"freshnessPercent": number 0-100, "qualityScore": number 0-100, "predictedShelfLifeHours": number, "spoilageWarning": string (empty if none), "summary": string (one sentence)}`;

  if (process.env.GEMINI_API_KEY && imageBase64) {
    try {
      const parts = [
        { text: prompt },
        { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } },
      ];
      const text = await callGemini(parts);
      const parsed = text && tryParseJSON(text);
      if (parsed) return parsed;
    } catch (err) {
      console.error("Gemini vision call failed, falling back to mock:", err.message);
    }
  }

  // Deterministic mock fallback (keeps the demo fully functional without a key)
  const freshnessPercent = Math.max(20, Math.round(96 - hoursSincePrep * 6));
  const qualityScore = Math.max(15, Math.round(freshnessPercent * 0.95));
  const predictedShelfLifeHours = Math.max(1, Math.round(10 - hoursSincePrep * 0.6));
  const spoilageWarning =
    freshnessPercent < 50 ? "Freshness is dropping — prioritize pickup within 1-2 hours." : "";
  return {
    freshnessPercent,
    qualityScore,
    predictedShelfLifeHours,
    spoilageWarning,
    summary: `Estimated from prep time (no Gemini key configured): ${freshnessPercent}% fresh, safe pickup window ~${predictedShelfLifeHours}h.`,
  };
}

/** AI Smart NGO Matching — scored ranking, Gemini optional refinement */
export function scoreNgoMatch({ ngo, donation, distanceKm }) {
  let score = 0;
  score += Math.max(0, 40 - distanceKm * 4); // closer is better, up to 40 pts
  const capacityLeft = (ngo.capacity || 10) - (ngo._activeLoad || 0);
  score += Math.min(30, capacityLeft * 3); // capacity headroom, up to 30 pts
  score += ngo.isVerified ? 15 : 0;
  score += Math.min(15, (ngo.ratingAvg || 3) * 3); // reputation, up to 15 pts
  return Math.round(score);
}

/** AI Chatbot answer using Gemini, with a rule-based fallback */
export async function chatbotReply(message) {
  const prompt = `You are the AI assistant for "AI Food Rescue Network", a platform connecting restaurants with NGOs and volunteers to rescue surplus food.
Answer the user's question helpfully, briefly (2-4 sentences), and encourage safe food handling.
User question: "${message}"`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini([{ text: prompt }]);
      if (text) return text.trim();
    } catch (err) {
      console.error("Gemini chatbot call failed, falling back:", err.message);
    }
  }

  const lower = message.toLowerCase();
  if (lower.includes("safe")) {
    return "Food is generally safe to donate within 2 hours of preparation if kept at a safe temperature, and up to 4 hours for dry/bakery items. Our AI freshness score on each donation gives a specific safe pickup deadline.";
  }
  if (lower.includes("ngo") || lower.includes("nearest")) {
    return "Once you post a donation, our Smart NGO Matching automatically ranks nearby verified NGOs by distance, capacity, and reliability — you'll see the best match in your dashboard.";
  }
  if (lower.includes("guideline") || lower.includes("donate")) {
    return "Good candidates for donation: freshly cooked meals within a few hours of prep, unopened packaged food before its expiry, and unspoiled bakery items. Avoid donating anything left unrefrigerated for long periods or showing signs of spoilage.";
  }
  return "I can help with food safety questions, donation guidelines, and finding the nearest NGO. Could you tell me a bit more about what you'd like to know?";
}

/** AI Review Analysis — summarize multiple reviews into actionable feedback */
export async function summarizeReviews(reviews) {
  if (!reviews.length) return "";
  const joined = reviews.map((r) => `- ${r}`).join("\n");
  const prompt = `Summarize this feedback for a food-rescue platform participant into one short, constructive sentence (max 20 words), balancing positives and one improvement area if any:\n${joined}`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini([{ text: prompt }]);
      if (text) return text.trim();
    } catch (err) {
      console.error("Gemini summary call failed, falling back:", err.message);
    }
  }
  return `Based on ${reviews.length} review(s): generally positive feedback from partners.`;
}
