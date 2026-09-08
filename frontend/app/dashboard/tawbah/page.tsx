"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function TawbahPage() {
  const [regret, setRegret] = useState("");
  const [intention, setIntention] = useState("");
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    const payload = { date: today, regret, intention };
    localStorage.setItem("rise_last_tawbah", JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-1 sm:px-0">
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
            Return and repent
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-1 flex items-center gap-2">
          Tawbah <Shield size={20} className="text-[#3C6E7A]" />
        </h1>
        <p className="text-sm text-stone-500 mb-8">{today}</p>

        <div className="bg-[#3C6E7A]/5 border border-[#3C6E7A]/20 rounded-2xl p-5 mb-8">
          <p className="text-sm text-stone-700 italic leading-relaxed">
            True tawbah has three conditions: sincere regret, stopping the wrong immediately,
            and a firm resolve not to return to it. If it involves another person, making it right with them too.
          </p>
        </div>

        <label className="block text-sm font-semibold text-stone-700 mb-2">
          What do you regret today?
        </label>
        <textarea
          value={regret}
          onChange={(e) => setRegret(e.target.value)}
          placeholder="Be specific — naming it clearly is part of sincerity."
          rows={4}
          className="w-full bg-stone-100 border border-stone-200 p-3 rounded-2xl outline-none focus:border-[#3C6E7A] text-stone-800 placeholder:text-stone-400 mb-6"
        />

        <label className="block text-sm font-semibold text-stone-700 mb-2">
          What is your firm intention going forward?
        </label>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="One clear resolve, not a vague hope."
          rows={4}
          className="w-full bg-stone-100 border border-stone-200 p-3 rounded-2xl outline-none focus:border-[#3C6E7A] text-stone-800 placeholder:text-stone-400 mb-8"
        />

        <button
          onClick={handleSave}
          className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
        >
          {saved ? "Saved ✓" : "Record my tawbah"}
        </button>

        <p className="text-xs text-stone-400 mt-4 text-center">
          This stays private. Allah loves those who turn back to Him often.
        </p>
      </div>
    </div>
  );
}