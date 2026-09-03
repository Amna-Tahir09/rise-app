"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

const FIELDS = [
  {
    key: "mistakes",
    label: "What mistakes did I make today?",
    placeholder: "Be honest — this is only for you.",
  },
  {
    key: "lost_control",
    label: "Where did I lose emotional control?",
    placeholder: "Anger, impatience, harsh words...",
  },
  {
    key: "triggers",
    label: "What triggered it?",
    placeholder: "Tiredness, a specific person, hunger, being rushed...",
  },
  {
    key: "sincere_action",
    label: "What was my most sincere action today?",
    placeholder: "Something done purely for Allah, with no one watching.",
  },
  {
    key: "tawbah",
    label: "What do I intend to change tomorrow?",
    placeholder: "One specific, small thing.",
  },
];

export default function MuhasabaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, ""]))
  );
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    const reflection_text = FIELDS.map(
      (f) => `${f.label}\n${answers[f.key].trim() || "—"}`
    ).join("\n\n");
    const payload = { date: today, reflection_text };
    localStorage.setItem("rise_last_muhasaba", JSON.stringify(payload));
    localStorage.setItem(`rise_muhasaba_log_${today}`, "true");
    console.log("Saved:", payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filled = FIELDS.filter((f) => answers[f.key].trim()).length;

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E7A]" />
          <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Daily reflection
          </span>
        </div>

        <h1 className="text-3xl font-serif text-stone-900 mb-1 flex items-center gap-2">
          Daily Muhasaba <Moon size={22} className="text-[#3C6E7A]" />
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

        <button
          onClick={handleSave}
          className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
        >
          {saved ? "Saved ✓" : "Save today's muhasaba"}
        </button>

        <p className="text-xs text-stone-400 mt-4 text-center">
          Your reflections are private and only used to give you grounded answers.
        </p>
      </div>
    </div>
  );
}