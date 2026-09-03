"use client";

import { useRouter } from "next/navigation";
import { Sparkles, MessageCircle, BookOpen, Activity, Shield, Sprout } from "lucide-react";

export default function TazkiyaDashboard({
  greetingName,
  today,
}: {
  greetingName: string;
  today: string;
}) {
  const router = useRouter();

  const switchToHabit = () => {
    localStorage.setItem("rise_mode", "habit");
    window.dispatchEvent(new Event("rise-mode-changed"));
    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-900 mb-1 flex items-center gap-2">
            Assalamu Alaikum{greetingName} <Sparkles size={26} className="text-amber-400" />
          </h1>
          <p className="text-gray-500">{today}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md px-5 py-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Tawbah Streak</p>
            <p className="text-2xl font-bold text-amber-500">0 Days</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md px-5 py-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Habits Today</p>
            <p className="text-2xl font-bold text-violet-500">0%</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-3xl shadow-xl p-6 mb-8">
        <p className="text-amber-200 text-sm font-medium mb-2">Wisdom of the Day</p>
        <p className="text-lg italic">
          The heart that does not find intimacy with Allah will seek it elsewhere.
        </p>
      </div>

      <h2 className="text-xl font-bold text-violet-900 mb-4">Your Path</h2>
      <div className="grid grid-cols-2 gap-4">
        <a href="/dashboard/chat" className="relative col-span-2 bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 border-2 border-amber-300 hover:shadow-lg transition-shadow">
          <span className="absolute top-3 right-3 text-xs font-semibold bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full">
            Featured
          </span>
          <MessageCircle size={26} className="text-violet-600 mb-2" />
          <h3 className="font-semibold text-gray-800">Ask Rise</h3>
          <p className="text-sm text-gray-500">Ask about a recurring struggle, grounded in your logs and classical guidance</p>
        </a>

        <a href="/dashboard/muhasaba" className="bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <BookOpen size={26} className="text-blue-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Daily Muhasaba</h3>
          <p className="text-sm text-gray-500">Evening self-reflection and accountability</p>
        </a>

        <a href="/dashboard/nafs" className="bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <Activity size={26} className="text-rose-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Nafs Tracker</h3>
          <p className="text-sm text-gray-500">Measure the 7 spiritual diseases</p>
        </a>

        <a href="/dashboard/tawbah" className="bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <Shield size={26} className="text-sky-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Tawbah</h3>
          <p className="text-sm text-gray-500">Turn back to Allah after a mistake</p>
        </a>

        <button
          onClick={switchToHabit}
          className="text-left bg-white/90 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow"
        >
          <Sprout size={26} className="text-green-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Try Habit Tracker</h3>
          <p className="text-sm text-gray-500">
            Want to track a general habit or goal instead? Switch to Habit Tracker.
          </p>
        </button>
      </div>
    </div>
  );
}