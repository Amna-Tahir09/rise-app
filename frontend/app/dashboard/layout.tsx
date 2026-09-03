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
} from "lucide-react";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("rise_mode");
    if (savedMode) setMode(savedMode);

    setUsername(localStorage.getItem("rise_username"));
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
    router.replace("/login");
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  const displayName = username || "Guest";
  const initial = username ? username[0].toUpperCase() : "G";
  const isLoggedIn = !!username;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50">
      {sidebarOpen && (
        <aside className="w-64 bg-violet-950 text-white p-6 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-amber-300">Rise</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-violet-300 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
          <p className="text-sm text-violet-300 mb-8">confront ~ grow ~ become</p>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-300 text-violet-900 font-bold flex items-center justify-center flex-shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-violet-300">
                {isLoggedIn ? "Seeker of Light" : "Exploring"}
              </p>
            </div>
          </div>

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
                      ? "bg-violet-800 text-amber-300 font-semibold"
                      : "text-violet-200 hover:bg-violet-900"
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
            className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-violet-200 border border-violet-700 hover:bg-violet-900 transition-all"
          >
            <Compass size={16} />
            {mode === "habit" ? "Switch to Tazkiya" : "Switch to Habit Tracker"}
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-950/40 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-amber-300 hover:bg-amber-950/20 transition-all"
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </aside>
      )}

      <main className="flex-1 p-8">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 text-violet-700 p-2 bg-white/90 rounded-xl shadow-md"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        {children}
      </main>
    </div>
  );
}