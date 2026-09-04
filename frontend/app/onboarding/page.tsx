"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const HABIT_QUESTIONS = ["What is your main goal?", "Why does this matter to you?", "What has stopped you before?"];
const TAZKIYA_QUESTIONS = ["What spiritual struggle do you return to most?", "Describe your current salah routine.", "What triggers you away from your best self?"];

export default function OnboardingPage() {
  const [mode, setMode] = useState("habit");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState("");
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

  const handleSubmit = () => {
    const hasEmpty = answers.some((a) => !a.trim());
    if (hasEmpty) {
      setError("Please answer all questions before continuing.");
      return;
    }
    const payload = questions.map((q, i) => ({ question: q, answer: answers[i] }));
    localStorage.setItem("rise_onboarding", JSON.stringify(payload));
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#3C6E7A]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block bg-gradient-to-r from-[#1C1917] to-[#3C6E7A] bg-clip-text text-transparent">
              Rise
            </span>
            <p className="text-xs tracking-widest text-stone-400 uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm">
          <button
            onClick={() => router.back()}
            className="text-stone-400 text-sm mb-5 flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E7A]" />
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
              {mode === "habit" ? "Habit tracker" : "Tazkiya"} onboarding
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-3 leading-tight">Let&apos;s get to know you.</h1>
          <p className="text-stone-500 mb-8">A few quick questions to start.</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {questions.map((q, index) => (
            <div key={index} className="mb-5">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {q} <span className="text-red-400">*</span>
              </label>
              <textarea
                className={`bg-stone-100 border p-3 w-full rounded-2xl focus:outline-none focus:border-[#3C6E7A] text-stone-800 ${
                  error && !answers[index].trim() ? "border-red-300" : "border-stone-200"
                }`}
                rows={2}
                value={answers[index]}
                onChange={(e) => updateAnswer(index, e.target.value)}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold mt-2 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}