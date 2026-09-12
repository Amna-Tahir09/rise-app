"use client";

import { useState, useEffect } from "react";
import HabitDashboard from "./_components/HabitDashboard";
import TazkiyaDashboard from "./_components/TazkiyaDashboard";
import { useSignupGate } from "./_components/SignupGate";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

const dateNDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

type HabitDashboardData = {
  best_streak?: number;
  today_rate?: number;
  week_rates?: number[];
  habits?: { id: string; name: string }[];
  today_log?: string[];
};

type TazkiyaDashboardData = {
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
};

export default function DashboardPage() {
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [habitData, setHabitData] = useState<HabitDashboardData>({});
  const [tazkiyaData, setTazkiyaData] = useState<TazkiyaDashboardData>({});
  const [loading, setLoading] = useState(true);
  const { requireAccount, GateModal } = useSignupGate();

  useEffect(() => {
    setMode(localStorage.getItem("rise_mode") || "habit");
    setUsername(localStorage.getItem("rise_username"));
    loadHabitData();
    loadTazkiyaData();

    const handleModeChange = () => setMode(localStorage.getItem("rise_mode") || "habit");
    const handleDataChange = () => {
      loadHabitData();
      loadTazkiyaData();
    };
    window.addEventListener("rise-mode-changed", handleModeChange);
    window.addEventListener("rise-chat-updated", handleDataChange);
    window.addEventListener("focus", handleDataChange);
    return () => {
      window.removeEventListener("rise-mode-changed", handleModeChange);
      window.removeEventListener("rise-chat-updated", handleDataChange);
      window.removeEventListener("focus", handleDataChange);
    };
  }, []);

  const loadHabitData = async () => {
    const habits = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
    const todayLog = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey()}`) || "[]");

    const todayRate = habits.length ? Math.round((todayLog.length / habits.length) * 100) : 0;

    const weekRates: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = dateNDaysAgo(i);
      const dayLog = JSON.parse(localStorage.getItem(`rise_habit_log_${day}`) || "[]");
      const rate = habits.length ? Math.round((dayLog.length / habits.length) * 100) : 0;
      weekRates.push(rate);
    }

    let localStreak = 0;
    for (let i = 0; i < 365; i++) {
      const day = dateNDaysAgo(i);
      const dayLog = JSON.parse(localStorage.getItem(`rise_habit_log_${day}`) || "[]");
      if (dayLog.length > 0) {
        localStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    let bestStreak = localStreak;
    const userId = getUserId();
    if (userId) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/${userId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (typeof json.best_streak === "number") {
            bestStreak = json.best_streak;
          } else if (typeof json.streak === "number") {
            bestStreak = json.streak;
          }
        }
      } catch (err) {
        console.error("Failed to load streak from server, using local calculation:", err);
      }
    }

    setHabitData({
      best_streak: bestStreak,
      today_rate: todayRate,
      week_rates: weekRates,
      habits,
      today_log: todayLog,
    });
    setLoading(false);
  };

  const loadTazkiyaData = () => {
    const muhasabaToday = localStorage.getItem(`rise_muhasaba_log_${todayKey()}`) === "true";

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = dateNDaysAgo(i);
      const done = localStorage.getItem(`rise_muhasaba_log_${day}`) === "true";
      if (done) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    setTazkiyaData({
      muhasaba_today: muhasabaToday,
      muhasaba_streak: streak,
    });
    setLoading(false);
  };

  // Same toggle behavior as the Habits Tracker page: update localStorage
  // immediately, sync to the backend, and respect the guest signup gate.
  const handleToggleHabit = async (habitId: string, habitName: string) => {
    if (requireAccount()) return;

    const currentLog = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey()}`) || "[]");
    const isDone = currentLog.includes(habitId);
    const updated = isDone ? currentLog.filter((id: string) => id !== habitId) : [...currentLog, habitId];
    localStorage.setItem(`rise_habit_log_${todayKey()}`, JSON.stringify(updated));

    // Reflect the change immediately in the dashboard UI
    loadHabitData();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habit-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          habits: [{ habit_name: habitName, done: !isDone, note: "" }],
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Habit-log sync failed:", res.status, errBody);
      }
    } catch (err) {
      console.error("Failed to sync habit-log to server:", err);
    }
  };

  const greetingName = username ? `, ${username}` : "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return <div className="p-8 text-[#8A8478] text-sm">Loading your dashboard...</div>;

  return (
    <>
      {mode === "habit" ? (
        <HabitDashboard data={habitData} greetingName={greetingName} today={today} onToggleHabit={handleToggleHabit} />
      ) : (
        <TazkiyaDashboard data={tazkiyaData} greetingName={greetingName} today={today} />
      )}
      <GateModal />
    </>
  );
}