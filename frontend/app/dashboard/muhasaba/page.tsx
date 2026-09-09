"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FIELDS = [
  { key: "mistakes", label: "What mistakes did I make today?", placeholder: "Be honest — this is only for you." },
  { key: "lost_control", label: "Where did I lose emotional control?", placeholder: "Anger, impatience, harsh words..." },
  { key: "triggers", label: "What triggered it?", placeholder: "Tiredness, a specific person, hunger, being rushed..." },
  { key: "sincere_action", label: "What was my most sincere action today?", placeholder: "Something done purely for Allah, with no one watching." },
  { key: "tawbah", label: "What do I intend to change tomorrow?", placeholder: "One specific, small thing." },
];

export default function MuhasabaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, ""]))
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleSave = async () => {
    const reflection_text = FIELDS.map(
      (f) => `${f.label}\n${answers[f.key].trim() || "—"}`
    ).join("\n\n");
    const payload = { date: today, reflection_text };
    localStorage.setItem("rise_last_muhasaba", JSON.stringify(payload));
    localStorage.setItem(`rise_muhasaba_log_${today}`, "true");

    const token = localStorage.getItem("rise_token");
    if (!token) {
      // guest mode: local only
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/muhasaba-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // CONFIRM: field name reflection_text matches your table description,
        // so this one's likely right — but confirm whether a log_type
        // discriminator is also expected here (see Nafs Tracker note) if
        // /muhasaba-log is shared across Tazkiya sub-features.
        body: JSON.stringify({ date: today, reflection_text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Couldn't save. Please try again.");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filled = FIELDS.filter((f) => answers[f.key].trim()).length;

  return (
    <div className="max-w-2xl mx-auto w-full px-1 sm:px-0">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#3C6E7A] transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div className="bg-white border border-stone-200 p-5 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E7A]" />
          <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Daily reflection
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-1 flex items-center gap-2">
          Daily Muhasaba <Moon size={20} className="text-[#3C6E7A]" />
        </h1>
        <p className="text-sm text-stone-500 mb-1">{today}</p>
        <p className="text-sm text-stone-400 mb-8">
          {filled} of {FIELDS.length} answered
        </p>

        {FIELDS.map((f) => (
          <div key={f.key} className="mb-6">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              {f.label}
            </label>
            <textarea
              value={answers[f.key]}
              onChange={(e) =>
                setAnswers({ ...answers, [f.key]: e.target.value })
              }
              placeholder={f.placeholder}
              rows={3}
              className="w-full bg-stone-100 border border-stone-200 p-3 rounded-2xl outline-none focus:border-[#3C6E7A] text-stone-800 placeholder:text-stone-400"
            />
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#3C6E7A] hover:bg-[#2C5560] disabled:opacity-60 text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
        >
          {loading ? "Saving..." : saved ? "Saved ✓" : "Save today's muhasaba"}
        </button>

        <p className="text-xs text-stone-400 mt-4 text-center">
          Your reflections are private and only used to give you grounded answers.
        </p>
      </div>
    </div>
  );
}