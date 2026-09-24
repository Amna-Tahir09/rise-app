// Save this as: app/dashboard/page.tsx
//
// MAJOR CHANGE: this page was reading most of its data from localStorage
// (habits list, today's log, week chart, salah, nafs severity, goals) —
// meaning none of it synced across devices or survived a cleared browser.
// With real users depending on this now, everything below is rewritten to
// read from the actual backend (/dashboard/{user_id} and /onboarding/{user_id})
// instead. Nothing about existing users' history is reset by this — the
// backend already had their real data, this just starts reading it.
"use client";

import { useState, useEffect } from "react";
import HabitDashboard from "./_components/HabitDashboard";
import TazkiyaDashboard from "./_components/TazkiyaDashboard";
import { useSignupGate } from "./_components/SignupGate";

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

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
  salah_today?: string[];
  severe_nafs?: { key: string; label: string; value: number }[];
};

const SALAH = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

const NAFS_LABELS: Record<string, string> = {
  takabbur: "Takabbur (pride)",
  hasad: "Hasad (envy)",
  riya: "Riya (showing off)",
  ghadab: "Ghadab (anger)",
  bukhl: "Bukhl (stinginess)",
  kizb: "Kizb (dishonesty)",
  kasl: "Kasl (laziness in worship)",
};

// The question text used for "the goal" question in each mode's onboarding
// — must match HABIT_QUESTIONS[0]/TAZKIYA_QUESTIONS[0] in onboarding/page.tsx
// exactly, since that's how goals get picked out of the full answer list.
const GOAL_QUESTIONS: Record<string, string> = {
  habit: "What is your main goal?",
  tazkiya: "What spiritual struggle do you return to most?",
};

// Habit insight — derived purely from numbers the backend already returns
// (best_streak, today_rate, habit/log counts), so it's correct on any
// device without needing extra backend work.
function computeHabitInsight(
  bestStreak: number,
  habitsCount: number,
  todayCount: number
): string | null {
  if (habitsCount === 0) return null;
  if (bestStreak >= 3) {
    return `You're on a ${bestStreak}-day streak — keep it up.`;
  }
  if (todayCount === 0) {
    return "Nothing logged yet today — a small step still counts.";
  }
  return null;
}

// Tazkiya insight — priority order: a currently-severe nafs rating first
// (most worth surfacing, links into Ask Rise), then a real salah trend
// from the week's data, then plain reflection consistency.
function computeTazkiyaInsight(
  muhasabaStreak: number,
  salahWeek: number[],
  severeNafs: { key: string; label: string; value: number }[]
): TazkiyaInsight | null {
  if (severeNafs.length > 0) {
    const top = severeNafs[0];
    const shortName = top.label.split(" (")[0];
    return {
      text: `${top.label} is rated high right now (${top.value}/5) — want to talk it through?`,
      ctaLabel: "Talk it through",
      ctaHref: "/dashboard/chat",
      chatPrefill: `Why does ${shortName} keep coming up for me lately?`,
    };
  }

  if (salahWeek.length >= 3) {
    const earliest = salahWeek[0];
    const latest = salahWeek[salahWeek.length - 1];
    if (earliest - latest >= 2) {
      return {
        text: `Your salah has gone from ${earliest}/5 to ${latest}/5 this week — want to talk about what's changed?`,
        ctaLabel: "Talk it through",
        ctaHref: "/dashboard/chat",
        chatPrefill: `My salah has dropped from ${earliest} to ${latest} out of 5 this week — can you help me understand why?`,
      };
    }
    if (latest - earliest >= 2 && latest === 5) {
      return { text: `Your salah has climbed from ${earliest}/5 to a full ${latest}/5 — that's real growth.` };
    }
  }

  if (muhasabaStreak >= 3) {
    return { text: `You've reflected ${muhasabaStreak} days running — that's real consistency.` };
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

  const loadGoals = async (currentMode: string) => {
    const userId = getUserId();
    if (!userId) {
      setGoals([]);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Onboarding fetch failed (${res.status})`);
      const answers: { id: number; mode: string; question: string; answer: string }[] = await res.json();
      const goalQuestion = GOAL_QUESTIONS[currentMode];
      const filtered = answers
        .filter((a) => a.mode === currentMode && a.question === goalQuestion)
        .map((a) => ({ id: String(a.id), text: a.answer }));
      setGoals(filtered);
    } catch (err) {
      console.error("Failed to load goals from server:", err);
      setGoals([]);
    }
  };

  const deleteGoal = async (id: string) => {
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        console.error("Delete goal failed:", res.status);
        setGoals(previous); // roll back the optimistic removal
      }
    } catch (err) {
      console.error("Failed to delete goal on server:", err);
      setGoals(previous);
    }
  };

  const loadHabitData = async () => {
    const userId = getUserId();
    if (!userId) {
      setHabitData({ best_streak: 0, today_rate: 0, week_rates: [0, 0, 0, 0, 0, 0, 0], habits: [], today_log: [], insight: null });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);
      const json = await res.json();

      const bestStreak = json.best_streak ?? 0;
      const habits = json.habits ?? [];
      const todayLog = json.today_log ?? [];

      setHabitData({
        best_streak: bestStreak,
        today_rate: json.today_rate ?? 0,
        week_rates: json.week_rates ?? [0, 0, 0, 0, 0, 0, 0],
        habits,
        today_log: todayLog,
        insight: computeHabitInsight(bestStreak, habits.length, todayLog.length),
      });
    } catch (err) {
      console.error("Failed to load habit dashboard from server:", err);
      setHabitData({ best_streak: 0, today_rate: 0, week_rates: [0, 0, 0, 0, 0, 0, 0], habits: [], today_log: [], insight: null });
    } finally {
      setLoading(false);
    }
  };

  const loadTazkiyaData = async () => {
    const userId = getUserId();
    if (!userId) {
      setTazkiyaData({ muhasaba_today: false, muhasaba_streak: 0, insight: null, salah_today: [], severe_nafs: [] });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);
      const json = await res.json();

      const muhasabaStreak = json.muhasaba_streak ?? 0;
      const salahWeek: number[] = json.salah_week ?? [];
      const severeNafs = (json.severe_nafs ?? []).map((n: { key: string; value: number }) => ({
        key: n.key,
        value: n.value,
        label: NAFS_LABELS[n.key] || n.key,
      }));

      setTazkiyaData({
        muhasaba_today: json.muhasaba_today ?? false,
        muhasaba_streak: muhasabaStreak,
        salah_today: json.salah_today ?? [],
        severe_nafs: severeNafs,
        insight: computeTazkiyaInsight(muhasabaStreak, salahWeek, severeNafs),
      });
    } catch (err) {
      console.error("Failed to load tazkiya dashboard from server:", err);
      setTazkiyaData({ muhasaba_today: false, muhasaba_streak: 0, insight: null, salah_today: [], severe_nafs: [] });
    } finally {
      setLoading(false);
    }
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

  // Same toggle behavior as the Habits Tracker page: optimistic local
  // update, sync to the backend, refetch after the save actually
  // completes so best_streak reflects the real, just-saved change.
  const handleToggleHabit = async (habitId: string, habitName: string) => {
    if (requireAccount()) return;

    const currentLog = habitData.today_log ?? [];
    const isDone = currentLog.includes(habitId);
    const updatedLog = isDone ? currentLog.filter((id) => id !== habitId) : [...currentLog, habitId];
    setHabitData((prev) => ({ ...prev, today_log: updatedLog }));

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
      loadHabitData();
    }
  };

  // Salah — same pattern, now genuinely backend-synced via the existing
  // /muhasaba-log route with log_type "salah" (backend change required —
  // see backend_dashboard_salah_changes.py).
  const toggleSalah = async (prayerKey: string) => {
    if (requireAccount()) return;

    const current = tazkiyaData.salah_today ?? [];
    const isDone = current.includes(prayerKey);
    const updated = isDone ? current.filter((k) => k !== prayerKey) : [...current, prayerKey];
    setTazkiyaData((prev) => ({ ...prev, salah_today: updated }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/muhasaba-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          log_type: "salah",
          reflection_text: JSON.stringify({ prayers: updated }),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Salah sync failed:", res.status, errBody);
      }
    } catch (err) {
      console.error("Failed to sync salah to server:", err);
    } finally {
      loadTazkiyaData();
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
        <TazkiyaDashboard data={tazkiyaData} greetingName={greetingName} today={today} goals={goals} onDeleteGoal={deleteGoal} onToggleSalah={toggleSalah} />
      )}
      <GateModal />
    </>
  );
}