"use client";

import { useState, useEffect } from "react";
import HabitDashboard from "./_components/HabitDashboard";
import TazkiyaDashboard from "./_components/TazkiyaDashboard";

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

// CONFIRM: exact shape returned by GET /dashboard/{user_id} — see note in previous file version.
type DashboardData = {
  habit_streak?: number;
  best_streak?: number;
  today_rate?: number;
  week_rates?: number[];
  habits?: { id: string; name: string }[];
  today_log?: string[];
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
};

export default function DashboardPage() {
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMode(localStorage.getItem("rise_mode") || "habit");
    setUsername(localStorage.getItem("rise_username"));
    fetchDashboard();

    const handleModeChange = () => setMode(localStorage.getItem("rise_mode") || "habit");
    window.addEventListener("rise-mode-changed", handleModeChange);
    return () => window.removeEventListener("rise-mode-changed", handleModeChange);
  }, []);

  const fetchDashboard = async () => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    try {
      const res = await fetch(`https://occupier-squall-handmade.ngrok-free.dev/dashboard/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load dashboard from server, falling back to local data:", err);
      const todayKey = new Date().toISOString().slice(0, 10);
      const habits = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
      const todayLog = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey}`) || "[]");
      setData({ habits, today_log: todayLog });
    } finally {
      setLoading(false);
    }
  };

  const greetingName = username ? `, ${username}` : "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return <div className="p-8 text-[#8A8478] text-sm">Loading your dashboard...</div>;

  return mode === "habit" ? (
    <HabitDashboard data={data} greetingName={greetingName} today={today} />
  ) : (
    <TazkiyaDashboard data={data} greetingName={greetingName} today={today} />
  );
}