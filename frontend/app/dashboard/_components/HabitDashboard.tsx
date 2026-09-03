"use client";

import { useRouter } from "next/navigation";
import { Sprout, MessageCircle, CheckSquare, Moon } from "lucide-react";

export default function HabitDashboard({
  greetingName,
  today,
}: {
  greetingName: string;
  today: string;
}) {
  const router = useRouter();

  const switchToTazkiya = () => {
    localStorage.setItem("rise_mode", "tazkiya");
    window.dispatchEvent(new Event("rise-mode-changed"));
    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-900 mb-1 flex items-center gap-2">
            Welcome back{greetingName} <Sprout size={26} className="text-green-500" />
          </h1>
          <p className="text-gray-500">{today}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md px-5 py-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Habit Streak</p>
            <p className="text-2xl font-bold text-amber-500">0 Days</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md px-5 py-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Habits Today</p>
            <p className="text-2xl font-bold text-violet-500">0%</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-500 to-amber-400 text-white rounded-3xl shadow-xl p-6 mb-8">
        <p className="text-sm font-medium mb-2 opacity-90">Keep Going</p>
        <p className="text-lg italic">
          Small steps, done consistently, build the life you want.
        </p>
      </div>

      <h2 className="text-xl font-bold text-violet-900 mb-4">Your Path</h2>
      <div className="grid grid-cols-2 gap-4">
        <a href="/dashboard/chat" className="relative bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 border-2 border-amber-300 hover:shadow-lg transition-shadow">
          <span className="absolute top-3 right-3 text-xs font-semibold bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full">
            Featured
          </span>
          <MessageCircle size={26} className="text-violet-600 mb-2" />
          <h3 className="font-semibold text-gray-800">Ask Rise</h3>
          <p className="text-sm text-gray-500">Ask why a habit keeps slipping</p>
        </a>

        <a href="/dashboard/habits" className="bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <CheckSquare size={26} className="text-green-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Habits Tracker</h3>
          <p className="text-sm text-gray-500">Log today habit</p>
        </a>

        <button
          onClick={switchToTazkiya}
          className="text-left bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow col-span-2"
        >
          <Moon size={26} className="text-violet-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Try Tazkiya Mode</h3>
          <p className="text-sm text-gray-500">
            Want a spiritual self-accountability practice instead? Switch to Tazkiya.
          </p>
        </button>
      </div>
    </div>
  );
}