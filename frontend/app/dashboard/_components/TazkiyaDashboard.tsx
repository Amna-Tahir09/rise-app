"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Activity, Shield, ArrowUpRight, Flame } from "lucide-react";

interface TazkiyaDashboardProps {
  greetingName?: string;
  today?: string;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function TazkiyaDashboard({ greetingName = "", today = "" }: TazkiyaDashboardProps) {
  const [hasMuhasabaToday, setHasMuhasabaToday] = useState(false);
  const [muhasabaStreak, setMuhasabaStreak] = useState(0);

  useEffect(() => {
    const last = localStorage.getItem("rise_last_muhasaba");
    if (last) {
      const parsed = JSON.parse(last);
      setHasMuhasabaToday(parsed.date === todayKey());
    }

    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      const done = localStorage.getItem(`rise_muhasaba_log_${key}`);
      if (done) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    setMuhasabaStreak(streak);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif text-stone-900">Welcome back{greetingName}</h1>
          <p className="text-stone-500 mt-1">{today}</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white border border-stone-200 rounded-2xl px-6 py-3 text-center">
            <p className="text-xs tracking-widest text-stone-400 uppercase flex items-center justify-center gap-1">
              <Flame size={12} className="text-[#3C6E7A]" />
              Tawbah Streak
            </p>
            <p className="text-2xl font-serif text-[#3C6E7A] mt-1">{muhasabaStreak} Days</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl px-6 py-3 text-center">
            <p className="text-xs tracking-widest text-stone-400 uppercase">Today</p>
            <p className="text-2xl font-serif text-stone-900 mt-1">{hasMuhasabaToday ? "Done" : "Pending"}</p>
          </div>
        </div>
      </div>

      {/* Wisdom banner */}
      <div className="bg-[#3C6E7A] rounded-3xl p-8">
        <p className="text-teal-100 text-sm mb-2">Wisdom of the day</p>
        <p className="text-white text-xl italic font-serif">
          The one who reflects on their soul each night purifies it before it hardens.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/muhasaba"
          className="bg-white border-2 border-[#3C6E7A] rounded-2xl p-6 hover:bg-[#3C6E7A]/5 transition-colors relative"
        >
          <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-widest uppercase text-[#3C6E7A] bg-[#3C6E7A]/10 px-2 py-1 rounded-full">
            Featured
          </span>
          <BookOpen className="text-[#3C6E7A] mb-3" size={22} />
          <h3 className="font-semibold text-stone-800">Daily Muhasaba</h3>
          <p className="text-sm text-stone-500 mt-1">
            {hasMuhasabaToday ? "You've reflected today" : "Reflect on today"}
          </p>
        </Link>

        <Link
          href="/dashboard/nafs"
          className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#3C6E7A]/40 transition-colors"
        >
          <Activity className="text-[#3C6E7A] mb-3" size={22} />
          <h3 className="font-semibold text-stone-800">Nafs Tracker</h3>
          <p className="text-sm text-stone-500 mt-1">Check your inner state</p>
        </Link>

        <Link
          href="/dashboard/tawbah"
          className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#3C6E7A]/40 transition-colors"
        >
          <Shield className="text-[#3C6E7A] mb-3" size={22} />
          <h3 className="font-semibold text-stone-800">Tawbah</h3>
          <p className="text-sm text-stone-500 mt-1">Return and repent</p>
        </Link>

        <Link
          href="/dashboard/chat"
          className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#3C6E7A]/40 transition-colors flex flex-col justify-between"
        >
          <div>
            <Flame className="text-[#3C6E7A] mb-3" size={22} />
            <h3 className="font-semibold text-stone-800">Ask Rise</h3>
            <p className="text-sm text-stone-500 mt-1">Ask why a struggle keeps returning</p>
          </div>
          <span className="text-xs font-medium text-[#3C6E7A] flex items-center gap-1 mt-4">
            Open chat <ArrowUpRight size={12} />
          </span>
        </Link>
      </div>
    </div>
  );
}