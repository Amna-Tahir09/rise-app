"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lightbulb } from "lucide-react";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

const REGRET_OPTIONS = [
  "I was short-tempered with someone I love",
  "I let my tongue say something I shouldn't have",
  "I delayed a prayer without a real reason",
  "I let jealousy or comparison get to me today",
];

const INTENTION_OPTIONS = [
  "Pause and breathe before reacting in anger",
  "Speak more gently, even when I'm frustrated",
  "Protect my prayer times no matter how busy I am",
  "Catch myself before comparing my life to others",
];

export default function TawbahPage() {
  const [regret, setRegret] = useState("");
  const [intention, setIntention] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openHint, setOpenHint] = useState<"regret" | "intention" | null>(null);
  const router = useRouter();

  useEffect(() => {
    const last = JSON.parse(localStorage.getItem("rise_last_tawbah") || "{}");
    if (last?.date === todayKey()) {
      setRegret(last.regret || "");
      setIntention(last.intention || "");
    }
  }, []);

  const toggleHint = (field: "regret" | "intention") => {
    setOpenHint(openHint === field ? null : field);
  };

  const selectRegretOption = (option: string) => {
    setRegret(option);
    setOpenHint(null);
  };

  const selectIntentionOption = (option: string) => {
    setIntention(option);
    setOpenHint(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { date: todayKey(), regret, intention };
    localStorage.setItem("rise_last_tawbah", JSON.stringify(payload));

    // Backend contract (shared /muhasaba-log, log_type="tawbah"):
    // { user_id, date, log_type: "tawbah", reflection_text }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          log_type: "tawbah",
          reflection_text: JSON.stringify({ tawbah_regret: regret, tawbah_intention: intention }),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Tawbah sync failed:", res.status, errBody);
      } else {
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to sync tawbah to server:", err);
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
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0674F]" />
          <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Return and repent</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2 mb-1">
          Tawbah <Shield size={20} className="text-[#E0674F]" />
        </h1>
        <p className="text-sm text-[#5A6B7A] mb-6">{new Date().toDateString()}</p>

        <div className="bg-[#E0674F]/6 border border-[#E0674F]/20 rounded-2xl p-4.5 mb-6">
          <p className="text-sm text-[#1E2A32] italic leading-relaxed">
            True tawbah has three conditions: sincere regret, stopping the wrong immediately, and a firm resolve not to return to it.
          </p>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <label className="text-sm font-semibold text-[#1E2A32]">What do you regret today?</label>
          <button
            type="button"
            onClick={() => toggleHint("regret")}
            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              openHint === "regret" ? "bg-[#E0674F] text-white" : "bg-[#F4F1EA] text-[#B0AA9C] hover:bg-[#E0674F]/30"
            }`}
            aria-label="Show example options"
          >
            <Lightbulb size={12} fill={openHint === "regret" ? "currentColor" : "none"} />
          </button>
        </div>

        {openHint === "regret" && (
          <div className="bg-[#FBEAE4] border border-[#E0674F]/30 rounded-xl p-3 mb-2">
            <p className="text-[11px] font-semibold text-[#A14C36] uppercase tracking-wide mb-2">
              Tap one to use it as a starting point
            </p>
            <div className="flex flex-col gap-1.5">
              {REGRET_OPTIONS.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectRegretOption(option)}
                  className="text-left text-xs text-[#4A3530] bg-white/70 hover:bg-white border border-[#E0674F]/25 hover:border-[#E0674F] rounded-lg px-3 py-2 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={regret}
          onChange={(e) => setRegret(e.target.value)}
          placeholder="Be specific — naming it clearly is part of sincerity."
          rows={3}
          className="w-full bg-[#F4F1EA] border border-[#E5E0D5] p-3.5 rounded-2xl text-sm mb-5 focus:outline-none focus:border-[#2E5E4E] placeholder:text-[#B0AA9C]"
        />

        <div className="flex items-center gap-1.5 mb-2">
          <label className="text-sm font-semibold text-[#1E2A32]">What is your firm intention going forward?</label>
          <button
            type="button"
            onClick={() => toggleHint("intention")}
            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              openHint === "intention" ? "bg-[#E0674F] text-white" : "bg-[#F4F1EA] text-[#B0AA9C] hover:bg-[#E0674F]/30"
            }`}
            aria-label="Show example options"
          >
            <Lightbulb size={12} fill={openHint === "intention" ? "currentColor" : "none"} />
          </button>
        </div>

        {openHint === "intention" && (
          <div className="bg-[#FBEAE4] border border-[#E0674F]/30 rounded-xl p-3 mb-2">
            <p className="text-[11px] font-semibold text-[#A14C36] uppercase tracking-wide mb-2">
              Tap one to use it as a starting point
            </p>
            <div className="flex flex-col gap-1.5">
              {INTENTION_OPTIONS.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectIntentionOption(option)}
                  className="text-left text-xs text-[#4A3530] bg-white/70 hover:bg-white border border-[#E0674F]/25 hover:border-[#E0674F] rounded-lg px-3 py-2 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="One clear resolve, not a vague hope."
          rows={3}
          className="w-full bg-[#F4F1EA] border border-[#E5E0D5] p-3.5 rounded-2xl text-sm mb-6 focus:outline-none focus:border-[#2E5E4E] placeholder:text-[#B0AA9C]"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#E0674F] hover:bg-[#C85640] text-white rounded-full py-3.5 font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Recorded ✓" : "Record my tawbah"}
        </button>
        <p className="text-center text-xs text-[#8A8478] mt-4">
          This stays private. Allah loves those who turn back to Him often.
        </p>
      </div>
      </div>
    </div>
  );
}