"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Moon } from "lucide-react";

export default function ModePage() {
  const [mode, setMode] = useState("habit");
  const router = useRouter();

  const handleContinue = () => {
    localStorage.setItem("rise_mode", mode);
    router.push("/onboarding");
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
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
              Choose your path
            </span>
          </div>

          <h1 className="text-4xl font-serif text-stone-900 mb-3 leading-tight">
            How will you rise?
          </h1>
          <p className="text-stone-500 mb-8">
            You can change this later in settings.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-7">
            <button
              onClick={() => setMode("habit")}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                mode === "habit"
                  ? "border-[#5E9B94] bg-[#5E9B94]/10"
                  : "border-stone-200 bg-stone-50 hover:border-stone-300"
              }`}
            >
              <Sprout
                className={mode === "habit" ? "text-[#5E9B94]" : "text-stone-400"}
                size={24}
              />
              <h3 className="font-semibold text-stone-800 mt-3">Habit Tracker</h3>
              <p className="text-sm text-stone-500">Track any habit or goal</p>
            </button>

            <button
              onClick={() => setMode("tazkiya")}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                mode === "tazkiya"
                  ? "border-[#5E9B94] bg-[#5E9B94]/10"
                  : "border-stone-200 bg-stone-50 hover:border-stone-300"
              }`}
            >
              <Moon
                className={mode === "tazkiya" ? "text-[#5E9B94]" : "text-stone-400"}
                size={24}
              />
              <h3 className="font-semibold text-stone-800 mt-3">Tazkiya</h3>
              <p className="text-sm text-stone-500">Islamic self-accountability</p>
            </button>
          </div>

          <button
            onClick={handleContinue}
            className="bg-[#1F3B33] hover:bg-[#183029] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}