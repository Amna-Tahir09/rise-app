"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const HABIT_QUESTIONS = [
  "What is your main goal?",
  "Why does this matter to you?",
  "What has stopped you before?",
];

const TAZKIYA_QUESTIONS = [
  "What spiritual struggle do you return to most?",
  "Describe your current salah routine.",
  "What triggers you away from your best self?",
];

export default function OnboardingPage() {
  const [mode, setMode] = useState("habit");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem("rise_mode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const questions = mode === "habit" ? HABIT_QUESTIONS : TAZKIYA_QUESTIONS;

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const payload = questions.map((q, i) => ({ question: q, answer: answers[i] }));
    localStorage.setItem("rise_onboarding", JSON.stringify(payload));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo block */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-violet-200 flex-shrink-0">
            <img
              src="/rise-logo.png"
              alt="Rise logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-2xl font-serif text-violet-900 leading-tight block">Rise</span>
            <p className="text-xs tracking-widest text-violet-400 uppercase">
              confront ~ grow ~ become
            </p>
          </div>
        </div>

        <div className="w-full bg-[#F7F3EC] border border-stone-200 p-8 rounded-3xl shadow-sm">
          <button
            onClick={() => router.back()}
            className="text-stone-400 text-sm mb-5 flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
              {mode === "habit" ? "Habit tracker" : "Tazkiya"} onboarding
            </span>
          </div>

          <h1 className="text-3xl font-serif text-stone-900 mb-3 leading-tight">
            Let&apos;s get to know you.
          </h1>
          <p className="text-stone-500 mb-8">A few quick questions to start.</p>

          {questions.map((q, index) => (
            <div key={index} className="mb-5">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {q}
              </label>
              <textarea
                className="bg-stone-100 border border-stone-200 p-3 w-full rounded-2xl focus:outline-none focus:border-violet-300 text-stone-800"
                rows={2}
                value={answers[index]}
                onChange={(e) => updateAnswer(index, e.target.value)}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="bg-[#1F3B33] hover:bg-[#183029] text-white px-4 py-3 rounded-full w-full font-semibold mt-2 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}