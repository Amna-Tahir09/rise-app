"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon } from "lucide-react";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

const QUESTIONS = [
  { key: "mistakes", label: "What mistakes did I make today?", placeholder: "Be honest — this is only for you." },
  { key: "lost_control", label: "Where did I lose emotional control?", placeholder: "Anger, impatience, harsh words..." },
  { key: "triggers", label: "What triggered those reactions?", placeholder: "A person, a moment, a thought..." },
  { key: "sincere_action", label: "What was my most sincere action today?", placeholder: "Something done purely for Allah, with no one watching." },
  { key: "tawbah", label: "What am I turning back from tonight?", placeholder: "One honest resolve for tomorrow." },
];

export default function MuhasabaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const last = JSON.parse(localStorage.getItem("rise_last_muhasaba") || "{}");
    if (last?.date === todayKey()) setAnswers(last.answers || {});
  }, []);

  const answeredCount = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { date: todayKey(), answers };
    localStorage.setItem("rise_last_muhasaba", JSON.stringify(payload));
    localStorage.setItem(`rise_muhasaba_log_${todayKey()}`, "true");

    // CONFIRM: exact field names for /muhasaba-log. Assuming it takes the 7-nafs-style
    // "answers" as a single JSON object keyed by question, matching the API contract
    // Rimsha mentioned (nafs_ratings stored as one JSON object). Adjust keys/shape once confirmed.
    try {
      await fetch("https://occupier-squall-handmade.ngrok-free.dev/muhasaba-log", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ user_id: getUserId(), date: todayKey(), reflection_text: JSON.stringify(answers) }),
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to sync muhasaba to server:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5 sm:p-8">
      <button onClick={() => router.push("/dashboard")} className="text-[#5A6B7A] text-sm mb-4 flex items-center gap-1 hover:text-[#1E2A32] transition-colors">
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
          <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Daily reflection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2 mb-1">
          Daily Muhasaba <Moon size={20} className="text-[#E8B84B]" />
        </h1>
        <p className="text-sm text-[#5A6B7A] mb-1">{new Date().toDateString()}</p>
        <p className="text-sm text-[#5A6B7A] mb-6">{answeredCount} of {QUESTIONS.length} answered</p>

        {QUESTIONS.map((q) => (
          <div key={q.key} className="mb-5">
            <label className="block text-sm font-semibold text-[#1E2A32] mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={2}
              className="w-full bg-[#F4F1EA] border border-[#E5E0D5] p-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#2E5E4E] placeholder:text-[#B0AA9C]"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#E8B84B] hover:bg-[#D6A83A] text-[#1E2A32] rounded-full py-3.5 font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save today's muhasaba"}
        </button>
        <p className="text-center text-xs text-[#8A8478] mt-4">
          Your reflections are private and only used to give you grounded answers.
        </p>
      </div>
    </div>
  );
}