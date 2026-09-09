"use client";

import Link from "next/link";
import { Flame, CheckSquare } from "lucide-react";

type DashboardData = {
  best_streak?: number;
  today_rate?: number;
  week_rates?: number[];
  habits?: { id: string; name: string }[];
  today_log?: string[];
};

export default function HabitDashboard({ data, greetingName, today }: { data: DashboardData; greetingName: string; today: string }) {
  const habits = data.habits ?? [];
  const todayLog = data.today_log ?? [];

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-serif text-[#1E2A32]">Welcome back{greetingName}</h1>
      <p className="text-sm text-[#5A6B7A] mt-1 mb-6">{today}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
          <div className="text-2xl font-serif text-[#1E2A32]">{todayLog.length}</div>
          <div className="text-xs text-[#5A6B7A] mt-1">Completed Today</div>
        </div>
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
          <div className="text-2xl font-serif text-[#1E2A32]">{Math.max(habits.length - todayLog.length, 0)}</div>
          <div className="text-xs text-[#5A6B7A] mt-1">Pending Today</div>
        </div>
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-5 flex items-center gap-2">
          <Flame size={20} className="text-[#E8B84B]" />
          <div>
            <div className="text-2xl font-serif text-[#1E2A32]">{data.best_streak ?? 0}</div>
            <div className="text-xs text-[#5A6B7A]">Best Streak</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6">
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
  );
}