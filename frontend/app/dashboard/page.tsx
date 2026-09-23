// Save this as: app/dashboard/page.tsx
// CHANGE (earlier fix, kept): handleToggleHabit previously called
// loadHabitData() BEFORE the POST /habit-log finished, so best_streak
// raced ahead of the save and showed stale data. Now it refetches again
// in `finally`, after the save has genuinely completed.
// CHANGE (this pass): reads the mode-specific onboarding goal
// (rise_onboarding_${mode}, first question's answer) and passes it down
// as a `goal` prop to both dashboards, so the goal the user set during
// onboarding is actually visible somewhere after they set it.
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
  insight?: string | null;
};

type TazkiyaInsight = {
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  chatPrefill?: string;
};

type TazkiyaDashboardData = {
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
  insight?: TazkiyaInsight | null;
};

const NAFS_LABELS: Record<string, string> = {
  takabbur: "Takabbur (pride)",
  hasad: "Hasad (envy)",
  riya: "Riya (showing off)",
  ghadab: "Ghadab (anger)",
  bukhl: "Bukhl (stinginess)",
  kizb: "Kizb (dishonesty)",
  kasl: "Kasl (laziness in worship)",
};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Computes one "Rise noticed..." insight for Habit mode, in priority order:
// a strong per-habit streak, then a day-of-week pattern (needs real
// history), then a gentle nudge if nothing's been logged in a while.
// Returns null when there isn't enough data to say anything meaningful yet.
function computeHabitInsight(habits: { id: string; name: string }[]): string | null {
  if (habits.length === 0) return null;

  let bestHabitName = "";
  let bestHabitStreak = 0;
  for (const h of habits) {
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const day = dateNDaysAgo(i);
      const dayLog: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${day}`) || "[]");
      if (dayLog.includes(h.id)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    if (streak > bestHabitStreak) {
      bestHabitStreak = streak;
      bestHabitName = h.name;
    }
  }
  if (bestHabitStreak >= 3) {
    return `You've completed "${bestHabitName}" ${bestHabitStreak} days running — keep it up.`;
  }

  const dayTotals: Record<number, { done: number; total: number }> = {};
  let daysWithData = 0;
  for (let i = 0; i < 28; i++) {
    const day = dateNDaysAgo(i);
    const raw = localStorage.getItem(`rise_habit_log_${day}`);
    if (raw !== null) {
      daysWithData++;
      const dow = new Date(day).getDay();
      const dayLog: string[] = JSON.parse(raw);
      if (!dayTotals[dow]) dayTotals[dow] = { done: 0, total: 0 };
      dayTotals[dow].total++;
      dayTotals[dow].done += dayLog.length;
    }
  }
  if (daysWithData >= 10) {
    let bestDay = -1;
    let bestRate = -1;
    for (const [dow, v] of Object.entries(dayTotals)) {
      if (v.total >= 2) {
        const rate = v.done / v.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = Number(dow);
        }
      }
    }
    if (bestDay >= 0 && bestRate > 0) {
      return `${DAY_NAMES[bestDay]}s tend to be your strongest day.`;
    }
  }

  let quietDays = 0;
  for (let i = 0; i < 14; i++) {
    const day = dateNDaysAgo(i);
    const dayLog: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${day}`) || "[]");
    if (dayLog.length === 0) {
      quietDays++;
    } else {
      break;
    }
  }
  if (quietDays >= 2) {
    return `It's been ${quietDays} days since you last logged a habit — a small step today still counts.`;
  }

  return null;
}

// Same idea for Tazkiya: a recurring nafs pattern first (most worth
// surfacing, and it links into Ask Rise), then reflection consistency,
// then a gentle "it's been a while" nudge.
function computeTazkiyaInsight(): TazkiyaInsight | null {
  const NAFS_KEYS = Object.keys(NAFS_LABELS);
  let worstKey = "";
  let worstStreak = 0;
  for (const key of NAFS_KEYS) {
    let streak = 0;
    for (let i = 0; i < 14; i++) {
      const day = dateNDaysAgo(i);
      const raw = localStorage.getItem(`rise_nafs_check_${day}`);
      if (!raw) {
        if (i === 0) continue;
        break;
      }
      const ratings = JSON.parse(raw);
      const val = ratings[key] || 0;
      if (val >= 3) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    if (streak > worstStreak) {
      worstStreak = streak;
      worstKey = key;
    }
  }
  if (worstStreak >= 3) {
    const shortName = NAFS_LABELS[worstKey].split(" (")[0];
    return {
      text: `${NAFS_LABELS[worstKey]} has come up strongly ${worstStreak} days in a row — want to talk it through?`,
      ctaLabel: "Talk it through",
      ctaHref: "/dashboard/chat",
      chatPrefill: `Why does ${shortName} keep coming up for me lately?`,
    };
  }

  let doneCount = 0;
  for (let i = 0; i < 5; i++) {
    const day = dateNDaysAgo(i);
    if (localStorage.getItem(`rise_muhasaba_log_${day}`) === "true") doneCount++;
  }
  if (doneCount >= 3) {
    return { text: `You've reflected ${doneCount} of the last 5 days — that's real consistency.` };
  }

  let sinceLast = -1;
  for (let i = 0; i < 30; i++) {
    const day = dateNDaysAgo(i);
    if (localStorage.getItem(`rise_muhasaba_log_${day}`) === "true") {
      sinceLast = i;
      break;
    }
  }
  if (sinceLast >= 2) {
    return { text: `It's been ${sinceLast} days since your last check-in — even a short one counts.` };
  }

  return null;
}

export default function DashboardPage() {
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [goals, setGoals] = useState<{ id: string; text: string }[]>([]);
  const [habitData, setHabitData] = useState<HabitDashboardData>({});
  const [tazkiyaData, setTazkiyaData] = useState<TazkiyaDashboardData>({});
  const [loading, setLoading] = useState(true);
  const { requireAccount, GateModal } = useSignupGate();

  const loadGoals = (currentMode: string) => {
    try {
      const goalsKey = `rise_goals_${currentMode}`;
      let saved = JSON.parse(localStorage.getItem(goalsKey) || "[]");
      if (!Array.isArray(saved)) saved = [];

      // One-time migration: onboarding submissions saved before goals were
      // tracked as a list only kept a single, overwritten answer. Pull that
      // in as the first goal so nothing already entered is lost.
      if (saved.length === 0) {
        const legacy = JSON.parse(localStorage.getItem(`rise_onboarding_${currentMode}`) || "[]");
        const legacyText = legacy[0]?.answer;
        if (legacyText) {
          saved = [{ id: crypto.randomUUID(), text: legacyText }];
          localStorage.setItem(goalsKey, JSON.stringify(saved));
        }
      }

      setGoals(saved);
    } catch {
      setGoals([]);
    }
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    localStorage.setItem(`rise_goals_${mode}`, JSON.stringify(updated));
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("rise_mode") || "habit";
    setMode(savedMode);
    setUsername(localStorage.getItem("rise_username"));
    loadGoals(savedMode);
    loadHabitData();
    loadTazkiyaData();

    const handleModeChange = () => {
      const updated = localStorage.getItem("rise_mode") || "habit";
      setMode(updated);
      loadGoals(updated);
    };
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
      insight: computeHabitInsight(habits),
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
      insight: computeTazkiyaInsight(),
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

    // Reflect the checkbox + today's % instantly — these are always computed
    // from localStorage, so this part is accurate immediately regardless of
    // the network request below.
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
    } finally {
      // Re-fetch AFTER the save has actually completed (success or fail),
      // so best_streak reflects the just-saved change instead of racing
      // ahead of it and showing stale server state.
      loadHabitData();
    }
  };

  const greetingName = username ? `, ${username}` : "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return <div className="p-8 text-[#8A8478] text-sm">Loading your dashboard...</div>;

  return (
    <>
      {mode === "habit" ? (
        <HabitDashboard data={habitData} greetingName={greetingName} today={today} goals={goals} onDeleteGoal={deleteGoal} onToggleHabit={handleToggleHabit} />
      ) : (
        <TazkiyaDashboard data={tazkiyaData} greetingName={greetingName} today={today} goals={goals} onDeleteGoal={deleteGoal} />
      )}
      <GateModal />
    </>
  );
}