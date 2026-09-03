"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Compass,
  BookOpen,
  Activity,
  CheckSquare,
  Shield,
  MessageCircle,
  Menu,
  LogOut,
  LogIn,
  Plus,
  Flame,
  ArrowLeft,
} from "lucide-react";
import FloatingChatButton from "./_components/FloatingChatButton";

const HABIT_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/habits", label: "Habits Tracker", icon: CheckSquare },
  { href: "/dashboard/chat", label: "Ask Rise", icon: MessageCircle },
];

const TAZKIYA_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/muhasaba", label: "Daily Muhasaba", icon: BookOpen },
  { href: "/dashboard/nafs", label: "Nafs Tracker", icon: Activity },
  { href: "/dashboard/tawbah", label: "Tawbah", icon: Shield },
  { href: "/dashboard/chat", label: "Ask Rise", icon: MessageCircle },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

function calcBestStreak(): number {
  const habits: { id: string }[] = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
  let best = 0;

  habits.forEach((habit) => {
    let streak = 0;
    let cursor = new Date();
    let skippedToday = false;

    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      const log: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${key}`) || "[]");
      const done = log.includes(habit.id);

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
    best = Math.max(best, streak);
  });

  return best;
}

function calcTodayRate(): number {
  const habits: { id: string }[] = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
  if (!habits.length) return 0;
  const log: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey()}`) || "[]");
  return Math.round((log.length / habits.length) * 100);
}

function calcTawbahStreak(): number {
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
  return streak;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayRate, setTodayRate] = useState(0);
  const [tawbahStreak, setTawbahStreak] = useState(0);

  useEffect(() => {
    const savedMode = localStorage.getItem("rise_mode");
    if (savedMode) setMode(savedMode);
    setUsername(localStorage.getItem("rise_username"));
    setStreak(calcBestStreak());
    setTodayRate(calcTodayRate());
    setTawbahStreak(calcTawbahStreak());

    const handleModeChange = () => {
      const updated = localStorage.getItem("rise_mode");
      if (updated) setMode(updated);
    };
    const refreshStats = () => {
      setStreak(calcBestStreak());
      setTodayRate(calcTodayRate());
      setTawbahStreak(calcTawbahStreak());
    };
    window.addEventListener("rise-mode-changed", handleModeChange);
    window.addEventListener("focus", refreshStats);
    return () => {
      window.removeEventListener("rise-mode-changed", handleModeChange);
      window.removeEventListener("focus", refreshStats);
    };
  }, []);

  const navItems = mode === "habit" ? HABIT_NAV_ITEMS : TAZKIYA_NAV_ITEMS;

  const switchMode = () => {
    const newMode = mode === "habit" ? "tazkiya" : "habit";
    localStorage.setItem("rise_mode", newMode);
    setMode(newMode);
    window.dispatchEvent(new Event("rise-mode-changed"));
    router.push("/dashboard");
  };

  const handleSignOut = () => {
    localStorage.removeItem("rise_user_id");
    localStorage.removeItem("rise_username");
    localStorage.removeItem("rise_access_token");
    localStorage.removeItem("rise_identifier");
    localStorage.removeItem("rise_mode");
    localStorage.removeItem("rise_guest");
    router.replace("/login");
  };

  const handleSignIn = () => {
    localStorage.removeItem("rise_guest");
    router.push("/login");
  };

  const displayName = username || "Guest";
  const initial = username ? username[0].toUpperCase() : "G";
  const isLoggedIn = !!username;

  return (
    <div className="min-h-screen flex bg-[#F7F3EC]">
      {sidebarOpen && (
        <aside className="w-64 bg-[#2C5560] p-6 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-serif text-white">Rise</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/60 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
          <p className="text-xs tracking-widest text-white/60 uppercase mb-6 ml-11">
            confront ~ grow ~ become
          </p>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-white/15 text-white font-bold flex items-center justify-center flex-shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{displayName}</p>
              <p className="text-xs text-white/60">{isLoggedIn ? "Seeker of Light" : "Exploring"}</p>
            </div>
          </div>

          {mode === "habit" ? (
            <>
              {/* Quick add habit */}
              <Link
                href="/dashboard/habits"
                className="flex items-center justify-center gap-2 mb-4 bg-white hover:bg-stone-100 text-[#3C6E7A] text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} />
                Add habit
              </Link>

              {/* Streak + progress */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex flex-col items-center">
                  <Flame className="text-white" size={16} />
                  <p className="text-lg font-serif text-white mt-1">{streak}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Streak</p>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="relative w-9 h-9">
                    <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${(todayRate / 100) * 94} 94`}
                      />
                    </svg>
                  </div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide mt-1">{todayRate}% today</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Quick add muhasaba */}
              <Link
                href="/dashboard/muhasaba"
                className="flex items-center justify-center gap-2 mb-4 bg-white hover:bg-stone-100 text-[#3C6E7A] text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} />
                Reflect today
              </Link>

              {/* Tawbah streak */}
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex items-center justify-center gap-2 mb-6">
                <Flame className="text-white" size={16} />
                <span className="text-lg font-serif text-white">{tawbahStreak}</span>
                <span className="text-[10px] text-white/60 uppercase tracking-wide">Day Streak</span>
              </div>
            </>
          )}

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={switchMode}
            className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 border border-white/25 hover:bg-white/10 transition-all"
          >
            <Compass size={16} />
            {mode === "habit" ? "Switch to Tazkiya" : "Switch to Habit Tracker"}
          </button>

          <div className="mt-4 pt-4 border-t border-white/20">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-200 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-all"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </aside>
      )}

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-4">
          {!sidebarOpen ? (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#3C6E7A] p-2 bg-white rounded-xl shadow-sm border border-stone-200"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={() => router.push("/mode")}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-[#3C6E7A] transition-colors"
          >
            <ArrowLeft size={14} />
            Change mode
          </button>
        </div>
        {children}
      </main>

      <FloatingChatButton />
    </div>
  );
}