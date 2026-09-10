"use client";

import Link from "next/link";
import { Flame, Moon, Activity, Shield, MessageCircle } from "lucide-react";

type DashboardData = {
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
};

export default function TazkiyaDashboard({ data, greetingName, today }: { data: DashboardData; greetingName: string; today: string }) {
  return (
    <div className="p-6 sm:p-10 relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.8,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2C3E40]">Welcome back{greetingName}</h1>
            <p className="text-sm text-[#5E7473] mt-1">{today}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-[#DCE4DC] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#5E7473] flex items-center justify-center gap-1">
                <Flame size={11} className="text-[#D6C6A8]" /> TAWBAH STREAK
              </p>
              <p className="text-lg font-serif text-[#2C3E40]">{data.muhasaba_streak ?? 0} Days</p>
            </div>
            <div className="bg-white border border-[#DCE4DC] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#5E7473]">TODAY</p>
              <p className="text-lg font-serif text-[#2C3E40]">{data.muhasaba_today ? "Done" : "Pending"}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2C3E40] rounded-2xl p-6 mb-6">
          <p className="text-xs text-[#D6C6A8] mb-2">Wisdom of the day</p>
          <p className="text-lg font-serif italic text-white">The one who reflects on their soul each night purifies it before it hardens.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/muhasaba" className="relative bg-white border-2 border-[#D6C6A8] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <span className="absolute top-5 right-5 text-[10px] tracking-wide bg-[#F4F1EA] text-[#5E7473] px-2.5 py-1 rounded-full">FEATURED</span>
            <Moon size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Daily Muhasaba</h3>
            <p className="text-xs text-[#5E7473] mt-1">{data.muhasaba_today ? "You've reflected today" : "Reflect on today"}</p>
          </Link>
          <Link href="/dashboard/nafs" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Activity size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Nafs Tracker</h3>
            <p className="text-xs text-[#5E7473] mt-1">Check your inner state</p>
          </Link>
          <Link href="/dashboard/tawbah" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Shield size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Tawbah</h3>
            <p className="text-xs text-[#5E7473] mt-1">Return and repent</p>
          </Link>
          <Link href="/dashboard/chat" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Flame size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Ask Rise</h3>
            <p className="text-xs text-[#5E7473] mt-1">Ask why a struggle keeps returning</p>
            <span className="text-xs font-semibold text-[#2C3E40] mt-2 inline-block">Open chat →</span>
          </Link>
        </div>
      </div>

      <Link
        href="/dashboard/chat"
        className="fixed bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-[#2C3E40] text-white flex items-center justify-center shadow-lg hover:bg-[#233033] transition-colors"
      >
        <MessageCircle size={20} />
      </Link>
    </div>
  );
}