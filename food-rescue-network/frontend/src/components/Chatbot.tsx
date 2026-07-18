import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

interface Msg { from: "user" | "bot"; text: string; }

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! I'm the Food Rescue AI assistant. Ask me about donation guidelines, food safety, or finding an NGO." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/ai/chat", { message: text });
      setMessages((m) => [...m, { from: "bot", text: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, I couldn't reach the assistant just now." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-forest text-gold text-2xl shadow-soft flex items-center justify-center hover:scale-105 transition"
        aria-label="Open assistant"
      >
        💬
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-5 z-40 w-80 h-96 card flex flex-col overflow-hidden"
          >
            <div className="bg-forest text-paper px-4 py-3 font-display font-semibold">Rescue Assistant</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl ${m.from === "bot" ? "bg-mist text-ink" : "bg-forest text-paper ml-auto"}`}>
                  {m.text}
                </div>
              ))}
              {sending && <div className="text-xs text-ink/40 font-mono">thinking...</div>}
            </div>
            <div className="p-2 border-t border-forest/10 flex gap-2">
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask a question..." className="input !py-2 text-sm"
              />
              <button onClick={send} className="btn-primary !px-3 !py-2 text-sm">→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
