"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Moon } from "lucide-react";

export default function ModePage() {
  const [mode, setMode] = useState("habit");
  const router = useRouter();

  const handleContinue = async () => {
    localStorage.setItem("rise_mode", mode);

    const userId = localStorage.getItem("rise_user_id") || "";
    const token = localStorage.getItem("rise_access_token") || "";

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/set-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: Number(userId), mode }),
      });
    } catch (err) {
      console.error("Failed to sync mode to server:", err);
    } finally {
      // Only send them through onboarding the FIRST time they pick this
      // specific mode. If they've already completed onboarding for it
      // before (habit or tazkiya), skip straight to the dashboard.
      const alreadyOnboarded = localStorage.getItem(`rise_onboarding_done_${mode}`) === "true";
      router.replace(alreadyOnboarded ? "/dashboard" : "/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#F9F7F4]">
      {/* Background photo layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.8,
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#2E5E4E]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block text-[#1E2A32]">Rise</span>
            <p className="text-xs tracking-widest text-[#2E5E4E] uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#E5E0D5] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E5E4E]" />
            <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Choose your path</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-[#1E2A32] mb-3 leading-tight">How will you rise?</h1>
          <p className="text-[#5A6B7A] mb-8">You can change this later in settings.</p>

          <div className="grid grid-cols-2 gap-4 mb-7">
            <button
              onClick={() => setMode("habit")}
              className={`p-5 sm:p-6 rounded-2xl border-2 text-left transition-all ${
                mode === "habit" ? "border-[#2E5E4E] bg-[#2E5E4E]/10" : "border-[#E5E0D5] bg-[#FAFAF8] hover:border-[#D6D0C0]"
              }`}
            >
              <Sprout className={mode === "habit" ? "text-[#2E5E4E]" : "text-[#A8A099]"} size={24} />
              <h3 className="font-semibold text-[#1E2A32] mt-3">Habit Tracker</h3>
              <p className="text-sm text-[#5A6B7A]">Track any habit or goal</p>
            </button>

            <button
              onClick={() => setMode("tazkiya")}
              className={`p-5 sm:p-6 rounded-2xl border-2 text-left transition-all ${
                mode === "tazkiya" ? "border-[#E8B84B] bg-[#E8B84B]/10" : "border-[#E5E0D5] bg-[#FAFAF8] hover:border-[#D6D0C0]"
              }`}
            >
              <Moon className={mode === "tazkiya" ? "text-[#C99A2E]" : "text-[#A8A099]"} size={24} />
              <h3 className="font-semibold text-[#1E2A32] mt-3">Tazkiya</h3>
              <p className="text-sm text-[#5A6B7A]">Islamic self-accountability</p>
            </button>
          </div>

          <button onClick={handleContinue} className="bg-[#2E5E4E] hover:bg-[#254D40] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}