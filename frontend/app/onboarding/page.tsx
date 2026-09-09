"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb, MessageCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const HABIT_QUESTIONS = [
  {
    question: "What is your main goal?",
    options: [
      "Sleep by 11pm and wake up by 6am",
      "Pray Fajr on time every day",
      "Exercise 3 times a week",
      "Read 20 pages before bed",
    ],
  },
  {
    question: "Why does this matter to you?",
    options: [
      "I'm always tired and late because I sleep late",
      "I want more energy to focus at work or study",
      "I feel guilty when I skip this, and I want that to stop",
      "It affects my mood and how I treat people around me",
    ],
  },
  {
    question: "What has stopped you before?",
    options: [
      "I scroll on my phone till 2am and can't sleep on time",
      "I keep skipping it when I'm tired after work",
      "I lose motivation after a few days",
      "I don't have a fixed time for it, so it keeps slipping",
    ],
  },
];

const TAZKIYA_QUESTIONS = [
  {
    question: "What spiritual struggle do you return to most?",
    options: [
      "I get angry quickly with my family",
      "I feel envious when others are doing better than me",
      "I feel proud of my own good deeds",
      "I struggle with laziness in worship",
    ],
  },
  {
    question: "Describe your current salah routine.",
    options: [
      "I pray 3 out of 5 daily, mostly late",
      "I pray all 5 but rarely with jamaah",
      "I miss Fajr most days",
      "I'm consistent but my focus wanders during salah",
    ],
  },
  {
    question: "What triggers you away from your best self?",
    options: [
      "Late nights on my phone",
      "Arguments with my siblings or family",
      "Feeling tired or stressed from work",
      "Comparing myself to others online",
    ],
  },
];

export default function OnboardingPage() {
  const [mode, setMode] = useState("habit");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openHint, setOpenHint] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem("rise_mode");
    if (savedMode) setMode(savedMode);
  }, []);

  const questions = mode === "habit" ? HABIT_QUESTIONS : TAZKIYA_QUESTIONS;

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    if (error) setError("");
  };

  const toggleHint = (index: number) => {
    setOpenHint(openHint === index ? null : index);
  };

  const selectOption = (index: number, option: string) => {
    updateAnswer(index, option);
    setOpenHint(null);
  };

  const handleSubmit = async () => {
    const hasEmpty = answers.some((a) => !a.trim());
    if (hasEmpty) {
      setError("Please answer all questions before continuing.");
      return;
    }

    const payload = questions.map((q, i) => ({ question: q.question, answer: answers[i] }));
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("rise_token");

      // Guests skip the backend — keep local-only behavior
      if (!token) {
        localStorage.setItem("rise_onboarding", JSON.stringify(payload));
        router.replace("/dashboard");
        return;
      }

      const res = await fetch(`${API_URL}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // CONFIRM: backend field names — "mode" + "answers" is the likely shape
        // given your backend doc mentions OnboardingAnswer table has a "mode" column
        body: JSON.stringify({ mode, answers: payload }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Couldn't save your answers. Please try again.");
      }

      localStorage.setItem("rise_onboarding", JSON.stringify(payload)); // keep local copy for quick UI reads
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#2E5E4E]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block text-[#1E2A32]">Rise</span>
            <p className="text-xs tracking-widest text-[#2E5E4E] uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full bg-white border border-[#E5E0D5] p-6 sm:p-8 rounded-3xl shadow-sm">
          <button
            onClick={() => router.back()}
            className="text-[#8A8478] text-sm mb-5 flex items-center gap-1 hover:text-[#5A6B7A] transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E5E4E]" />
            <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">
              {mode === "habit" ? "Habit tracker" : "Tazkiya"} onboarding
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] mb-3 leading-tight">Let&apos;s get to know you.</h1>
          <p className="text-[#5A6B7A] mb-4">A few quick questions to start.</p>

          <div className="flex items-start gap-2.5 bg-[#2E5E4E]/6 border border-[#2E5E4E]/15 rounded-2xl p-3.5 mb-6">
            <MessageCircle size={16} className="text-[#2E5E4E] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#3F5048] leading-relaxed">
              Your answers help Rise's chat give you grounded, personal replies later — the more honest and specific you are here, the better Rise can recognize your own patterns when you ask it something.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {questions.map((q, index) => (
            <div key={index} className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-sm font-semibold text-[#1E2A32]">
                  {q.question} <span className="text-[#E0674F]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleHint(index)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    openHint === index ? "bg-[#E8B84B] text-[#1E2A32]" : "bg-[#F4F1EA] text-[#B5822C] hover:bg-[#E8B84B]/30"
                  }`}
                  aria-label="Show example options"
                >
                  <Lightbulb size={12} fill={openHint === index ? "currentColor" : "none"} />
                </button>
              </div>

              {openHint === index && (
                <div className="bg-[#FBF3DC] border border-[#E8B84B]/40 rounded-xl p-3 mb-2">
                  <p className="text-[11px] font-semibold text-[#8A6A1E] uppercase tracking-wide mb-2">
                    Tap one to use it as a starting point
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => selectOption(index, option)}
                        className="text-left text-xs text-[#5A4A1E] bg-white/70 hover:bg-white border border-[#E8B84B]/30 hover:border-[#E8B84B] rounded-lg px-3 py-2 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                className={`bg-[#F4F1EA] border p-3 w-full rounded-2xl focus:outline-none focus:border-[#2E5E4E] text-[#1E2A32] ${
                  error && !answers[index].trim() ? "border-[#E0674F]/40" : "border-[#E5E0D5]"
                }`}
                rows={2}
                value={answers[index]}
                onChange={(e) => updateAnswer(index, e.target.value)}
                disabled={loading}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#2E5E4E] hover:bg-[#254D40] text-white px-4 py-3 rounded-full w-full font-semibold mt-2 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}