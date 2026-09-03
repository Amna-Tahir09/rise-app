"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

const NAFS_ITEMS = [
  {
    key: "takabbur",
    label: "Takabbur",
    subtitle: "Pride / arrogance",
    description: "Feeling superior to others, dismissing advice, wanting to be seen as better.",
  },
  {
    key: "hasad",
    label: "Hasad",
    subtitle: "Envy",
    description: "Discomfort at others' blessings, wishing what they have was taken away.",
  },
  {
    key: "riya",
    label: "Riya",
    subtitle: "Insincerity / showing off",
    description: "Doing good deeds to be seen or praised rather than for Allah alone.",
  },
  {
    key: "ghadab",
    label: "Ghadab",
    subtitle: "Anger",
    description: "Losing composure, harsh words or reactions, holding grudges.",
  },
  {
    key: "shahwat",
    label: "Shahwat",
    subtitle: "Desire",
    description: "Being pulled by cravings — food, comfort, attention — beyond what's needed.",
  },
  {
    key: "bukhl",
    label: "Bukhl",
    subtitle: "Stinginess",
    description: "Withholding wealth, time, or kindness out of fear of loss.",
  },
  {
    key: "ghaflah",
    label: "Ghaflah",
    subtitle: "Heedlessness",
    description: "Going through the day disconnected from remembrance and intention.",
  },
];

const SEVERITY_LABELS = ["None", "Slight", "Mild", "Noticeable", "Strong", "Overwhelming"];

function severityColor(value: number) {
  if (value === 0) return "text-stone-400";
  if (value <= 2) return "text-[#3C6E7A]";
  if (value <= 3) return "text-amber-600";
  return "text-red-500";
}

export default function NafsPage() {
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(NAFS_ITEMS.map((n) => [n.key, 0]))
  );
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const setRating = (key: string, value: number) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleSave = () => {
    const payload = { date: today, ratings };
    localStorage.setItem("rise_last_nafs_check", JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalScore = Object.values(ratings).reduce((sum, v) => sum + v, 0);

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E7A]" />
          <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Inner check
          </span>
        </div>

        <h1 className="text-3xl font-serif text-stone-900 mb-1 flex items-center gap-2">
          Nafs Tracker <Activity size={22} className="text-[#3C6E7A]" />
        </h1>
        <p className="text-sm text-stone-500 mb-1">{today}</p>
        <p className="text-sm text-stone-400 mb-8">
          Rate how present each of these felt today — 0 is not at all, 5 is overwhelming.
        </p>

        {NAFS_ITEMS.map((item) => (
          <div key={item.key} className="mb-6 pb-6 border-b border-stone-100 last:border-0 last:pb-0 last:mb-0">
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <span className="text-sm font-semibold text-stone-800">{item.label}</span>
                <span className="text-xs text-stone-400 ml-2">{item.subtitle}</span>
              </div>
              <span className={`text-xs font-semibold ${severityColor(ratings[item.key])}`}>
                {SEVERITY_LABELS[ratings[item.key]]}
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3">{item.description}</p>

            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setRating(item.key, val)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    ratings[item.key] === val
                      ? "bg-[#3C6E7A] text-white"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-stone-600">Total score</span>
          <span className="text-lg font-serif text-[#3C6E7A]">{totalScore} / 35</span>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
        >
          {saved ? "Saved ✓" : "Save today's check"}
        </button>

        <p className="text-xs text-stone-400 mt-4 text-center">
          This is between you and Allah. Being honest here is the first step to change.
        </p>
      </div>
    </div>
  );
}