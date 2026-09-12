"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Lightbulb } from "lucide-react";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

const QUESTIONS = [
  {
    key: "mistakes",
    label: "What mistakes did I make today?",
    placeholder: "Be honest — this is only for you.",
    options: [
      "I snapped at someone over something small",
      "I put off something important again",
      "I said something I didn't fully mean",
      "I wasted a lot of time without noticing",
    ],
  },
  {
    key: "lost_control",
    label: "Where did I lose emotional control?",
    placeholder: "Anger, impatience, harsh words...",
    options: [
      "I got impatient with my family",
      "I raised my voice when I didn't need to",
      "I let a small annoyance ruin my mood for hours",
      "I didn't lose control today, but I felt close to it",
    ],
  },
  {
    key: "triggers",
    label: "What triggered those reactions?",
    placeholder: "A person, a moment, a thought...",
    options: [
      "Being tired or running on little sleep",
      "A comment from someone close to me",
      "Comparing myself to someone else",
      "Feeling like I wasn't being heard",
    ],
  },
  {
    key: "sincere_action",
    label: "What was my most sincere action today?",
    placeholder: "Something done purely for Allah, with no one watching.",
    options: [
      "A prayer I made sure to focus in, even when rushed",
      "Helping someone without mentioning it to anyone",
      "Holding back a harsh reply I wanted to give",
      "Honestly, I'm not sure anything today was fully sincere",
    ],
  },
  {
    key: "tawbah",
    label: "What am I turning back from tonight?",
    placeholder: "One honest resolve for tomorrow.",
    options: [
      "Being short-tempered with the people I love most",
      "Delaying things I know I should just do",
      "Letting my phone take time I meant to spend better",
      "Judging myself more harshly than I judge others",
    ],
  },
];

export default function MuhasabaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openHint, setOpenHint] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const last = JSON.parse(localStorage.getItem("rise_last_muhasaba") || "{}");
    if (last?.date === todayKey()) setAnswers(last.answers || {});
  }, []);

  const answeredCount = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleHint = (index: number) => {
    setOpenHint(openHint === index ? null : index);
  };

  const selectOption = (key: string, index: number, option: string) => {
    handleChange(key, option);
    setOpenHint(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { date: todayKey(), answers };
    localStorage.setItem("rise_last_muhasaba", JSON.stringify(payload));
    localStorage.setItem(`rise_muhasaba_log_${todayKey()}`, "true");

    // Backend contract (shared /muhasaba-log, log_type="muhasaba"):
    // { user_id, date, log_type: "muhasaba", reflection_text }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          log_type: "muhasaba",
          reflection_text: JSON.stringify(answers),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Muhasaba sync failed:", res.status, errBody);
      } else {
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to sync muhasaba to server:", err);
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
          <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Daily reflection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2 mb-1">
          Daily Muhasaba <Moon size={20} className="text-[#E8B84B]" />
        </h1>
        <p className="text-sm text-[#5A6B7A] mb-1">{new Date().toDateString()}</p>
        <p className="text-sm text-[#5A6B7A] mb-6">{answeredCount} of {QUESTIONS.length} answered</p>

        {QUESTIONS.map((q, index) => (
          <div key={q.key} className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-semibold text-[#1E2A32]">{q.label}</label>
              <button
                type="button"
                onClick={() => toggleHint(index)}
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  openHint === index ? "bg-[#E8B84B] text-[#1E2A32]" : "bg-[#F4F1EA] text-[#B0AA9C] hover:bg-[#E8B84B]/30"
                }`}
                aria-label="Show example options"
              >
                <Lightbulb size={12} fill={openHint === index ? "currentColor" : "none"} />
              </button>
            </div>

            {openHint === index && (
              <div className="bg-[#FBF3E0] border border-[#E8B84B]/40 rounded-xl p-3 mb-2">
                <p className="text-[11px] font-semibold text-[#8A6D2F] uppercase tracking-wide mb-2">
                  Tap one to use it as a starting point
                </p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => selectOption(q.key, index, option)}
                      className="text-left text-xs text-[#4A4536] bg-white/70 hover:bg-white border border-[#E8B84B]/30 hover:border-[#E8B84B] rounded-lg px-3 py-2 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
    </div>
  );
}