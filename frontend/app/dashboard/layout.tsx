"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const HABIT_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🔲" },
  { href: "/dashboard/habits", label: "Habits Tracker", icon: "✅" },
  { href: "/dashboard/chat", label: "Ask Rise", icon: "💬" },
];

const TAZKIYA_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🔲" },
  { href: "/dashboard/muhasaba", label: "Daily Muhasaba", icon: "📖" },
  { href: "/dashboard/nafs", label: "Nafs Tracker", icon: "💓" },
  { href: "/dashboard/habits", label: "Habits Tracker", icon: "✅" },
  { href: "/dashboard/tawbah", label: "Tawbah", icon: "🛡️" },
  { href: "/dashboard/chat", label: "Ask Rise", icon: "💬" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);

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

  const displayName = username || "Guest";
  const initial = username ? username[0].toUpperCase() : "G";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50">
      <aside className="w-64 bg-violet-950 text-white p-6 flex-shrink-0 flex flex-col">
        <h1 className="text-2xl font-bold text-amber-300">Rise</h1>
        <p className="text-sm text-violet-300 mb-8">confront ~ grow ~ become</p>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-amber-300 text-violet-900 font-bold flex items-center justify-center">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-sm">{displayName}</p>
            <p className="text-xs text-violet-300">
              {username ? "Seeker of Light" : "Exploring"}
            </p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
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
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={switchMode}
          className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-violet-200 border border-violet-700 hover:bg-violet-900 transition-all"
        >
          {mode === "habit" ? "🌙 Switch to Tazkiya" : "🌱 Switch to Habit Tracker"}
        </button>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}