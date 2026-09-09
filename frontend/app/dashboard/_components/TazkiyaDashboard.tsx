"use client";

import Link from "next/link";
import { Flame, Moon } from "lucide-react";

type DashboardData = {
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
};

export default function TazkiyaDashboard({ data, greetingName, today }: { data: DashboardData; greetingName: string; today: string }) {
  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-serif text-[#1E2A32]">Welcome back{greetingName}</h1>
      <p className="text-sm text-[#5A6B7A] mt-1 mb-6">{today}</p>

      <div className="bg-[#1E2A32] rounded-2xl p-6 mb-6">
        <p className="text-xs text-[#E8B84B] mb-2">Tawbah Streak</p>
        <div className="flex items-center gap-2">
          <Flame size={22} className="text-[#E8B84B]" />
          <span className="text-2xl font-serif text-white">{data.muhasaba_streak ?? 0} Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/muhasaba" className="bg-white border-2 border-[#E8B84B] rounded-2xl p-6 hover:shadow-md transition-shadow">
          <Moon size={22} className="text-[#E8B84B] mb-3" />
          <h3 className="font-semibold text-[#1E2A32]">Daily Muhasaba</h3>
          <p className="text-xs text-[#5A6B7A] mt-1">{data.muhasaba_today ? "You've reflected today" : "Reflect on today"}</p>
        </Link>
        <Link href="/dashboard/nafs" className="bg-white border border-[#E5E0D5] rounded-2xl p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[#1E2A32]">Nafs Tracker</h3>
          <p className="text-xs text-[#5A6B7A] mt-1">Check your inner state</p>
        </Link>
        <Link href="/dashboard/tawbah" className="bg-white border border-[#E5E0D5] rounded-2xl p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[#1E2A32]">Tawbah</h3>
          <p className="text-xs text-[#5A6B7A] mt-1">Return and repent</p>
        </Link>
        <Link href="/dashboard/chat" className="bg-white border border-[#E5E0D5] rounded-2xl p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[#1E2A32]">Ask Rise</h3>
          <p className="text-xs text-[#5A6B7A] mt-1">Ask why a struggle keeps returning</p>
        </Link>
      </div>
    </div>
  );
}