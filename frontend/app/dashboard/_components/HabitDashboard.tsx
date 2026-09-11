"use client";

import Link from "next/link";
import { Flame, CheckSquare, Clock, CheckCircle2 } from "lucide-react";

type DashboardData = {
  best_streak?: number;
  today_rate?: number;
  week_rates?: number[];
  habits?: { id: string; name: string }[];
  today_log?: string[];
};

const DAY_LABELS = ["6d", "5d", "4d", "3d", "2d", "Yest", "Today"];

export default function HabitDashboard({ data, greetingName, today }: { data: DashboardData; greetingName: string; today: string }) {
  const habits = data.habits ?? [];
  const todayLog = data.today_log ?? [];
  const pending = Math.max(habits.length - todayLog.length, 0);
  const todayRate = data.today_rate ?? (habits.length ? Math.round((todayLog.length / habits.length) * 100) : 0);
  const weekRates = data.week_rates ?? [0, 0, 0, 0, 0, 0, todayRate];

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (todayRate / 100) * circumference;

  return (
    <div className="p-6 sm:p-10 relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.7,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#1E2A32]">Welcome back{greetingName}</h1>
            <p className="text-sm text-[#1E2A32] mt-1">{today}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-[#E5E0D5] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#8A8478]">STREAK</p>
              <p className="text-lg font-serif text-[#2E5E4E]">{data.best_streak ?? 0} Days</p>
            </div>
            <div className="bg-white border border-[#E5E0D5] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#8A8478]">TODAY</p>
              <p className="text-lg font-serif text-[#1E2A32]">{todayRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2E5E4E] rounded-2xl p-6 mb-6">
          <p className="text-xs text-[#B7D4C6] mb-2">Keep going</p>
          <p className="text-lg font-serif italic text-white">Small steps, done consistently, build the life you want.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
            <CheckCircle2 size={18} className="text-[#2E5E4E] mb-2" />
            <div className="text-2xl font-serif text-[#1E2A32]">{todayLog.length}</div>
            <div className="text-xs text-[#5A6B7A] mt-1">Completed Today</div>
          </div>
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
            <Clock size={18} className="text-[#5A6B7A] mb-2" />
            <div className="text-2xl font-serif text-[#1E2A32]">{pending}</div>
            <div className="text-xs text-[#5A6B7A] mt-1">Pending Today</div>
          </div>
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
            <Flame size={18} className="text-[#E8B84B] mb-2" />
            <div className="text-2xl font-serif text-[#1E2A32]">{data.best_streak ?? 0}</div>
            <div className="text-xs text-[#5A6B7A] mt-1">Best Streak</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E0D5" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r={radius} fill="none" stroke="#2E5E4E" strokeWidth="10"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-serif text-[#1E2A32]">{todayRate}%</span>
                <span className="text-xs text-[#8A8478]">today</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6">
            <p className="text-sm font-semibold text-[#1E2A32] mb-4">Last 7 Days</p>
            <div className="flex items-end justify-between gap-2 h-28">
              {weekRates.map((rate, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className={`w-full rounded-md ${i === weekRates.length - 1 ? "bg-[#2E5E4E]" : "bg-[#E5E0D5]"}`}
                    style={{ height: `${Math.max(rate, 4)}%` }}
                  />
                  <span className="text-[10px] text-[#8A8478]">{DAY_LABELS[i] ?? ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E5E4E] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-semibold text-[#1E2A32] flex items-center gap-2">
              <CheckSquare size={16} className="text-[#2E5E4E]" /> Today&apos;s Habits
            </p>
            <Link href="/dashboard/habits" className="text-xs font-semibold text-[#2E5E4E]">Manage habits →</Link>
          </div>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-[#8A8478]">
              <p className="text-sm mb-3">No habits yet</p>
              <Link href="/dashboard/habits" className="text-sm font-semibold text-[#2E5E4E]">Add your first habit</Link>
            </div>
          ) : (
            habits.map((h) => (
              <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${todayLog.includes(h.id) ? "border-[#2E5E4E] bg-[#2E5E4E]/5" : "border-[#E5E0D5]"}`}>
                <div className={`w-4.5 h-4.5 rounded-md border-2 ${todayLog.includes(h.id) ? "bg-[#2E5E4E] border-[#2E5E4E]" : "border-[#C9C4B8]"}`} />
                <span className="text-sm text-[#1E2A32]">{h.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}