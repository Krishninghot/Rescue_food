import { chatbotReply } from "../utils/gemini.js";

// POST /api/ai/chat  { message }
export async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });
    const reply = await chatbotReply(message);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/voice-donation  { transcript }
// Parses a spoken sentence like "We have 25 veg meals available" into structured fields.
export async function parseVoiceDonation(req, res, next) {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ message: "transcript is required" });

    const lower = transcript.toLowerCase();
    const quantityMatch = lower.match(/(\d+)/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const dietType = lower.includes("non-veg") || lower.includes("non veg") || lower.includes("chicken") || lower.includes("meat")
      ? "non-veg"
      : lower.includes("vegan")
      ? "vegan"
      : "veg";
    const category = lower.includes("bak") ? "Bakery" : lower.includes("bread") ? "Bakery" : "Cooked Meal";

    res.json({
      parsed: {
        quantity,
        dietType,
        category,
        foodName: transcript.replace(/we have|available|meals?/gi, "").trim() || "Surplus meals",
      },
    });
  } catch (err) {
    next(err);
  }
}
