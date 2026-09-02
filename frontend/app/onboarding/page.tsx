"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl">
        <button
          onClick={() => router.back()}
          className="text-violet-400 text-sm mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="text-3xl mb-2">{mode === "habit" ? "🌱" : "🌙"}</div>
        <h1 className="text-2xl font-bold mb-1 text-violet-900">
          {mode === "habit" ? "Habit Tracker Onboarding" : "Tazkiya Onboarding"}
        </h1>
        <p className="text-violet-400 mb-6">Let's get to know you a little</p>

        {questions.map((q, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-violet-700 mb-1">
              {q}
            </label>
            <textarea
              className="border border-violet-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
              rows={2}
              value={answers[index]}
              onChange={(e) => updateAnswer(index, e.target.value)}
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-violet-400 to-amber-300 text-white px-4 py-3 rounded-xl w-full font-medium mt-2 hover:opacity-90 transition-opacity shadow-md"
        >
          Continue ✨
        </button>
      </div>
    </div>
  );
}