"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, Sparkles } from "lucide-react";
import { useSignupGate } from "../_components/SignupGate";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

const DISEASES = [
  { key: "takabbur", name: "Takabbur", sub: "Pride / arrogance", desc: "Feeling superior to others, dismissing advice." },
  { key: "ghadab", name: "Ghadab", sub: "Anger", desc: "Losing composure, harsh words or reactions." },
  { key: "hasad", name: "Hasad", sub: "Envy", desc: "Wishing someone else's blessing was taken away." },
  { key: "riya", name: "Riya", sub: "Showing off", desc: "Doing good to be seen, not for Allah alone." },
  { key: "bukhl", name: "Bukhl", sub: "Stinginess", desc: "Holding back time, money, or help you could give." },
  { key: "kizb", name: "Kizb", sub: "Dishonesty", desc: "Small exaggerations or half-truths." },
  { key: "kasl", name: "Kasl", sub: "Laziness in worship", desc: "Delaying or rushing through acts of worship." },
];

// Plain, practical suggestions — deliberately NOT attributed to any scholar
// or presented as a classical quote. Keeping these generic avoids the exact
// fabrication risk this whole app is built to prevent.
const OVERCOME_TIPS: Record<string, string> = {
  takabbur: "Try genuinely thanking someone today for something they did better than you.",
  ghadab: "Next time you feel it rising, pause and take three slow breaths before responding.",
  hasad: "Make a small dua for the person whose blessing you envied.",
  riya: "Do one good deed today that only Allah will know about.",
  bukhl: "Give something small away today — time, money, or help — without expecting anything back.",
  kizb: "Notice today when you're tempted to exaggerate or soften the truth, and choose honesty instead.",
  kasl: "Pick one prayer today and give it your full, unrushed attention.",
};

const severityLabel = (n: number) => (n === 0 ? "None" : n <= 2 ? "Mild" : n <= 3 ? "Moderate" : "Severe");
const severityColor = (n: number) => (n === 0 ? "text-[#B0AA9C]" : n <= 2 ? "text-[#2E5E4E]" : "text-[#E0674F]");

export default function NafsPage() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [highlight, setHighlight] = useState<{ key: string; value: number } | null>(null);
  const router = useRouter();
  const { requireAccount, GateModal } = useSignupGate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`rise_nafs_check_${todayKey()}`) || "{}");
    setRatings(saved || {});
  }, []);

  const total = Object.values(ratings).reduce((sum, v) => sum + (v || 0), 0);

  const handleTalkItThrough = () => {
    if (!highlight) return;
    const label = DISEASES.find((d) => d.key === highlight.key)?.name || highlight.key;
    localStorage.setItem("rise_chat_prefill", `I rated ${label} high today — can you help me understand and work on it?`);
    router.push("/dashboard/chat");
  };

  const setRating = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (requireAccount()) return; // guests get the signup prompt instead of a real save

    // Find the single highest-rated disease this submission. Only surface
    // a tip when it's genuinely high (4-5, "Severe" on the existing scale)
    // — not just whichever happens to be the max of a mostly-zero set.
    let topKey = "";
    let topVal = -1;
    for (const d of DISEASES) {
      const v = ratings[d.key] || 0;
      if (v > topVal) {
        topVal = v;
        topKey = d.key;
      }
    }
    setHighlight(topVal >= 4 ? { key: topKey, value: topVal } : null);

    setSaving(true);
    // Per-day key (not a single shared key) so multi-day patterns — like a
    // nafs disease trending up over several days — can actually be computed
    // later for the dashboard insight card.
    localStorage.setItem(`rise_nafs_check_${todayKey()}`, JSON.stringify(ratings));
    // A Nafs check-in is one of the three ways to "show up" for Tazkiya
    // today (alongside Muhasaba and Tawbah) — without this line, doing
    // only a nafs check-in never counted toward the streak at all.
    localStorage.setItem(`rise_muhasaba_log_${todayKey()}`, "true");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          log_type: "nafs_check",
          nafs_ratings: ratings,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Nafs check sync failed:", res.status, errBody);
      } else {
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to sync nafs ratings to server:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/habits-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto p-5 sm:p-8">
      <button onClick={() => router.push("/dashboard")} className="text-[#5A6B7A] text-sm mb-4 flex items-center gap-1 hover:text-[#1E2A32] transition-colors">
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
          <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Inner check</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2 mb-1">
          Nafs Tracker <Activity size={20} className="text-[#E8B84B]" />
        </h1>
        <p className="text-sm text-[#5A6B7A] mb-7">Rate how present each of these felt today.</p>

        {DISEASES.map((d, i) => (
          <div key={d.key} className={`mb-5 pb-5 ${i < DISEASES.length - 1 ? "border-b border-[#F0EDE6]" : ""}`}>
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <span className="text-sm font-semibold text-[#1E2A32]">{d.name}</span>
                <span className="text-xs text-[#8A8478] ml-2">{d.sub}</span>
              </div>
              <span className={`text-xs font-semibold ${severityColor(ratings[d.key] || 0)}`}>{severityLabel(ratings[d.key] || 0)}</span>
            </div>
            <p className="text-xs text-[#5A6B7A] mb-2.5">{d.desc}</p>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(d.key, n)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                    (ratings[d.key] || 0) === n ? "bg-[#E0674F] text-white" : "bg-[#F4F1EA] text-[#5A6B7A] hover:bg-[#E5E0D5]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-[#F4F1EA] border border-[#E5E0D5] rounded-2xl p-4 flex justify-between items-center mb-5">
          <span className="text-sm text-[#5A6B7A]">Total score</span>
          <span className="text-lg font-serif text-[#E8B84B]">{total} / {DISEASES.length * 5}</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#E8B84B] hover:bg-[#D6A83A] text-[#1E2A32] rounded-full py-3.5 font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save today's check"}
        </button>

        {saved && highlight && (
          <div className="bg-[#FBF3E0] border border-[#E8B84B]/40 rounded-2xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-[#C99A2E] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] tracking-wide text-[#8A6D2F] uppercase mb-0.5">
                  {DISEASES.find((d) => d.key === highlight.key)?.name} came up high today
                </p>
                <p className="text-sm text-[#4A4536]">{OVERCOME_TIPS[highlight.key]}</p>
                <button
                  onClick={handleTalkItThrough}
                  className="text-xs font-semibold text-[#8A6D2F] mt-2 underline hover:text-[#4A4536] transition-colors"
                >
                  Talk it through →
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#8A8478] mt-4">
          Your ratings are private and only used to help Rise recognize your own patterns.
        </p>
      </div>
      </div>
      <GateModal />
    </div>
  );
}