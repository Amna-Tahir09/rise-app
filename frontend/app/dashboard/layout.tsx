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

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayRate, setTodayRate] = useState(0);
  const [tawbahStreak, setTawbahStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fetchStats = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/${userId}`, {
        headers: { "ngrok-skip-browser-warning": "true", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStreak(data.best_streak ?? 0);
      setTodayRate(data.today_rate ?? 0);
      setTawbahStreak(data.muhasaba_streak ?? 0);
    } catch (err) {
      console.error("Failed to load sidebar stats from server:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("rise_mode");
    if (savedMode) setMode(savedMode);
    setUsername(localStorage.getItem("rise_username"));
    fetchStats();

    const handleModeChange = () => {
      const updated = localStorage.getItem("rise_mode");
      if (updated) setMode(updated);
    };
    window.addEventListener("rise-mode-changed", handleModeChange);
    window.addEventListener("focus", fetchStats);
    return () => {
      window.removeEventListener("rise-mode-changed", handleModeChange);
      window.removeEventListener("focus", fetchStats);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchStats();
  }, [pathname, mounted]);

  const navItems = mode === "habit" ? HABIT_NAV_ITEMS : TAZKIYA_NAV_ITEMS;

  const switchMode = async () => {
    const newMode = mode === "habit" ? "tazkiya" : "habit";
    localStorage.setItem("rise_mode", newMode);
    setMode(newMode);
    window.dispatchEvent(new Event("rise-mode-changed"));

    // Sync the new mode to the backend — without this, current_user.mode
    // stays out of date in the database and /chat breaks.
    const userId = getUserId();
    const token = getToken();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/set-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: Number(userId), mode: newMode }),
      });
    } catch (err) {
      console.error("Failed to sync mode to server:", err);
    }

    // Only send them to onboarding the first time they switch into this
    // specific mode. If they've already onboarded for it before, go
    // straight to the dashboard.
    const alreadyOnboarded = localStorage.getItem(`rise_onboarding_done_${newMode}`) === "true";
    router.push(alreadyOnboarded ? "/dashboard" : "/onboarding");
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
  const showSidebar = !mounted || sidebarOpen;

  return (
    <div className="min-h-screen flex bg-[#F2F6F0]">
      {showSidebar && (
        <aside
          className="w-64 p-6 flex-shrink-0 flex flex-col relative overflow-hidden"
          style={{
            background:
              mode === "habit"
                ? "radial-gradient(circle at 15% 10%, rgba(232,184,75,0.14), transparent 45%), radial-gradient(circle at 90% 85%, rgba(255,255,255,0.06), transparent 50%), #3A5654"
                : "radial-gradient(circle at 15% 10%, rgba(232,184,75,0.13), transparent 45%), radial-gradient(circle at 90% 85%, rgba(46,94,78,0.16), transparent 50%), linear-gradient(155deg, #4A5D73 0%, #3A4A5D 60%, #2C3944 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-serif text-white">Rise</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white p-1" aria-label="Close sidebar">
              <Menu size={20} />
            </button>
          </div>
          <p className="text-xs tracking-widest text-white/60 uppercase mb-6 ml-11">confront ~ grow ~ become</p>

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
              <Link href="/dashboard/habits" className="flex items-center justify-center gap-2 mb-4 bg-white hover:bg-[#EAF0E8] text-[#4B6E6D] text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors">
                <Plus size={16} /> Add habit
              </Link>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex flex-col items-center">
                  <Flame className="text-[#D6C6A8]" size={16} />
                  <p className="text-lg font-serif text-white mt-1">{streak}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Streak</p>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="relative w-9 h-9">
                    <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#D6C6A8" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(todayRate / 100) * 94} 94`} />
                    </svg>
                  </div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide mt-1">{todayRate}% today</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard/muhasaba" className="flex items-center justify-center gap-2 mb-4 bg-white hover:bg-[#EAF0E8] text-[#4B6E6D] text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors">
                <Plus size={16} /> Reflect today
              </Link>
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex items-center justify-center gap-2 mb-6">
                <Flame className="text-[#D6C6A8]" size={16} />
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${active ? "bg-white/15 text-white font-semibold" : "text-white/70 hover:bg-white/10"}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button onClick={switchMode} className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 border border-white/25 hover:bg-white/10 transition-all">
            <Compass size={16} />
            {mode === "habit" ? "Switch to Tazkiya" : "Switch to Habit Tracker"}
          </button>

          <div className="mt-4 pt-4 border-t border-white/20">
            {isLoggedIn ? (
              <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-200 hover:bg-red-500/10 transition-all">
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button onClick={handleSignIn} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-all">
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
          </div>
        </aside>
      )}

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-4">
          {mounted && !sidebarOpen ? (
            <button onClick={() => setSidebarOpen(true)} className="text-[#4B6E6D] p-2 bg-white rounded-xl shadow-sm border border-[#DCE4DC]" aria-label="Open sidebar">
              <Menu size={20} />
            </button>
          ) : (
            <span />
          )}
          <button onClick={() => router.push("/mode")} className="flex items-center gap-1 text-sm text-[#5E7473] hover:text-[#4B6E6D] transition-colors">
            <ArrowLeft size={14} /> Change mode
          </button>
        </div>
        {children}
      </main>

      <FloatingChatButton />
    </div>
  );
}