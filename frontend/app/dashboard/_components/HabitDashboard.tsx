"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Flame, ArrowUpRight } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  time?: string;
  note?: string;
}

interface HabitDashboardProps {
  greetingName?: string;
  today?: string;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const dayKeyOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

function calcStreak(habitId: string): number {
  let streak = 0;
  let cursor = new Date();
  let skippedToday = false;

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const log: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${key}`) || "[]");
    const done = log.includes(habitId);

    if (done) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (!skippedToday && key === todayKey()) {
      skippedToday = true;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitDashboard({ greetingName = "", today = "" }: HabitDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLog, setTodayLog] = useState<string[]>([]);
  const [weekRates, setWeekRates] = useState<number[]>([]);

  useEffect(() => {
    const list: Habit[] = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
    setHabits(list);

    const log: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey()}`) || "[]");
    setTodayLog(log);

    const rates: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const key = dayKeyOffset(i);
      const dayLog: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${key}`) || "[]");
      rates.push(list.length ? Math.round((dayLog.length / list.length) * 100) : 0);
    }
    setWeekRates(rates);
  }, []);

  const toggleHabit = (id: string) => {
    const updated = todayLog.includes(id)
      ? todayLog.filter((h) => h !== id)
      : [...todayLog, id];
    setTodayLog(updated);
    localStorage.setItem(`rise_habit_log_${todayKey()}`, JSON.stringify(updated));
  };

  const completedToday = todayLog.length;
  const pendingToday = Math.max(habits.length - completedToday, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, calcStreak(h.id)), 0);
  const completionRate = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

  const dayLabels = ["6d", "5d", "4d", "3d", "2d", "Yest", "Today"];

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
            <p className="text-xs tracking-widest text-stone-400 uppercase">Habit Streak</p>
            <p className="text-2xl font-serif text-[#3C6E7A] mt-1">{bestStreak} Days</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl px-6 py-3 text-center">
            <p className="text-xs tracking-widest text-stone-400 uppercase">Habits Today</p>
            <p className="text-2xl font-serif text-stone-900 mt-1">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Quote banner */}
      <div className="bg-[#3C6E7A] rounded-3xl p-8">
        <p className="text-teal-100 text-sm mb-2">Keep going</p>
        <p className="text-white text-xl italic font-serif">
          Small steps, done consistently, build the life you want.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <CheckCircle2 className="text-[#3C6E7A] mb-2" size={20} />
          <p className="text-2xl font-serif text-stone-900">{completedToday}</p>
          <p className="text-xs text-stone-500 mt-1">Completed Today</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <Clock className="text-[#3C6E7A] mb-2" size={20} />
          <p className="text-2xl font-serif text-stone-900">{pendingToday}</p>
          <p className="text-xs text-stone-500 mt-1">Pending Today</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <Flame className="text-[#3C6E7A] mb-2" size={20} />
          <p className="text-2xl font-serif text-stone-900">{bestStreak}</p>
          <p className="text-xs text-stone-500 mt-1">Best Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Completion ring */}
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E7E2D8" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#3C6E7A"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(completionRate / 100) * 314} 314`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-serif text-stone-900">{completionRate}%</span>
              <span className="text-xs text-stone-500">today</span>
            </div>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div className="md:col-span-3 bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-sm font-semibold text-stone-700 mb-4">Last 7 Days</p>
          <div className="flex items-end justify-between h-32 gap-2">
            {weekRates.map((rate, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-stone-100 rounded-md flex items-end h-24 overflow-hidden">
                  <div
                    className="w-full bg-[#3C6E7A] rounded-md transition-all"
                    style={{ height: `${rate}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's habits */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-stone-700">Today's Habits</p>
          <Link
            href="/dashboard/habits"
            className="text-xs font-medium text-[#3C6E7A] flex items-center gap-1 hover:underline"
          >
            Manage habits <ArrowUpRight size={12} />
          </Link>
        </div>

        {habits.length === 0 ? (
          <p className="text-sm text-stone-400">
            No habits yet.{" "}
            <Link href="/dashboard/habits" className="text-[#3C6E7A] underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => {
              const done = todayLog.includes(habit.id);
              return (
                <label
                  key={habit.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    done ? "border-[#3C6E7A] bg-[#3C6E7A]/5" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleHabit(habit.id)}
                      className="w-4 h-4 accent-[#3C6E7A]"
                    />
                    <div>
                      <p className={`text-sm ${done ? "text-stone-900 font-medium" : "text-stone-700"}`}>
                        {habit.name}
                      </p>
                      {habit.note && <p className="text-xs text-stone-400">{habit.note}</p>}
                    </div>
                  </div>
                  {habit.time && <span className="text-xs text-stone-400">{habit.time}</span>}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}