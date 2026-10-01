// Save this as: app/dashboard/muhasaba/page.tsx
//
// CHANGES:
// - Today's answers now load from the backend (GET /muhasaba-log/{user_id}),
//   not browser storage, so they show up on any device.
// - New "Your past reflections" section: every earlier muhasaba, newest
//   first, tap a day to open it.
// - Saving again on the same day updates that day's entry (the backend
//   upserts), so history stays one entry per day.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Lightbulb, ChevronDown, BookOpen } from "lucide-react";
import { useSignupGate } from "../_components/SignupGate";

const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
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

type HistoryEntry = { id: number; date: string; reflection_text: string | null };

const parseAnswers = (text: string | null): Record<string, string> => {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return { mistakes: text };
  }
};

const prettyDate = (iso: string) => {
  const today = localDate();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

export default function MuhasabaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openEntry, setOpenEntry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [openHint, setOpenHint] = useState<number | null>(null);
  const router = useRouter();
  const { requireAccount, GateModal } = useSignupGate();

  const loadHistory = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log/${userId}?log_type=muhasaba`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`History fetch failed (${res.status})`);
      const rows: HistoryEntry[] = await res.json();
      setHistory(rows);
      const todays = rows.find((r) => r.date === localDate());
      if (todays) setAnswers(parseAnswers(todays.reflection_text));
    } catch (err) {
      console.error("Failed to load muhasaba history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const answeredCount = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;
  const pastEntries = history.filter((h) => h.date !== localDate());

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (requireAccount()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: Number(getUserId()),
          date: localDate(),
          log_type: "muhasaba",
          reflection_text: JSON.stringify(answers),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Save failed (${res.status})`);
      }
      setSaved(true);
      loadHistory();
    } catch (err) {
      console.error("Failed to save muhasaba:", err);
      setError("Couldn't save just now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-[#8A8478] text-sm">Loading your reflections...</div>;
  }

  return (
    <div className="relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url('/habits-bg.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15 }}
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
                  onClick={() => setOpenHint(openHint === index ? null : index)}
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
                  <p className="text-[11px] font-semibold text-[#8A6D2F] uppercase tracking-wide mb-2">Tap one to use it as a starting point</p>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => {
                          handleChange(q.key, option);
                          setOpenHint(null);
                        }}
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

          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-3">{error}</div>}

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

        {/* Past reflections */}
        <div className="mt-6">
          <h2 className="text-xl font-serif text-[#1E2A32] flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-[#B5A07A]" /> Your past reflections
          </h2>

          {pastEntries.length === 0 ? (
            <div className="bg-white/80 border border-[#E5E0D5] rounded-2xl p-5 text-sm text-[#8A8478]">
              Your earlier reflections will gather here, one for each night you sit with yourself.
            </div>
          ) : (
            <div className="space-y-2">
              {pastEntries.map((entry) => {
                const entryAnswers = parseAnswers(entry.reflection_text);
                const isOpen = openEntry === entry.id;
                const preview = QUESTIONS.map((q) => entryAnswers[q.key]).find((a) => a && a.trim());
                return (
                  <div key={entry.id} className="bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenEntry(isOpen ? null : entry.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAF7F0] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E2A32]">{prettyDate(entry.date)}</p>
                        {!isOpen && preview && <p className="text-xs text-[#8A8478] truncate">{preview}</p>}
                      </div>
                      <ChevronDown size={16} className={`text-[#8A8478] flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3 border-t border-[#F0EDE6] pt-3">
                        {QUESTIONS.filter((q) => entryAnswers[q.key]?.trim()).map((q) => (
                          <div key={q.key}>
                            <p className="text-xs font-semibold text-[#8A6D2F]">{q.label}</p>
                            <p className="text-sm text-[#1E2A32] mt-0.5">{entryAnswers[q.key]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <GateModal />
    </div>
  );
}