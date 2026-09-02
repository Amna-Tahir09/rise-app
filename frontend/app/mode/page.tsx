"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModePage() {
  const [mode, setMode] = useState("habit");
  const router = useRouter();

  const handleContinue = () => {
    localStorage.setItem("rise_mode", mode);
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold mb-1 text-violet-900">Choose your path</h1>
        <p className="text-violet-400 mb-6">You can change this later in settings</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setMode("habit")}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              mode === "habit"
                ? "border-amber-400 bg-amber-50 shadow-md"
                : "border-violet-100 bg-white hover:border-violet-200"
            }`}
          >
            <div className="text-2xl mb-1">🌱</div>
            <h3 className="font-semibold text-amber-700">Habit Tracker</h3>
            <p className="text-sm text-gray-500">Track any habit or goal</p>
          </button>

          <button
            onClick={() => setMode("tazkiya")}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              mode === "tazkiya"
                ? "border-violet-400 bg-violet-50 shadow-md"
                : "border-violet-100 bg-white hover:border-violet-200"
            }`}
          >
            <div className="text-2xl mb-1">🌙</div>
            <h3 className="font-semibold text-violet-700">Tazkiya</h3>
            <p className="text-sm text-gray-500">Islamic self-accountability</p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 text-white px-4 py-3 rounded-xl w-full font-medium hover:opacity-90 transition-opacity shadow-md"
        >
          Continue ✨
        </button>
      </div>
    </div>
  );
}