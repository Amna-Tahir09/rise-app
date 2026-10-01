// Save this as: app/dashboard/_components/HabitDashboard.tsx
//
// REDESIGN: "The vine." Replaces the stack of stat boxes, progress ring,
// bar chart and checklist with one living vine, borrowed from the landing
// page's own vine doodle. Each day you showed up grows a leaf; missed days
// stay as small buds (waiting, not broken). Same props and same backend
// data as before (week_rates, today_log, habits, best_streak, insight,
// goals), so dashboard/page.tsx needs no changes.
"use client";

import Link from "next/link";
import { Caveat, Playfair_Display, Inter } from "next/font/google";
import { Leaf, Sprout, X, Flame, CheckCircle2, Clock, Target } from "lucide-react";

const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600"] });
// Three-font system, matching the landing page:
// Playfair Display for headings and numbers, Inter for body text,
// Caveat only for personal, handwritten moments.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

type DashboardData = {
  best_streak?: number;
  today_rate?: number;
  week_rates?: number[];
  habits?: { id: string; name: string }[];
  today_log?: string[];
  insight?: string | null;
};

// Fixed points along the vine path, one per day (oldest to today)
const VINE_POINTS = [
  { x: 45, y: 46, r: -35 },
  { x: 125, y: 58, r: 30 },
  { x: 205, y: 66, r: -30 },
  { x: 285, y: 40, r: -30 },
  { x: 365, y: 32, r: 25 },
  { x: 445, y: 46, r: -25 },
  { x: 525, y: 56, r: -20 },
];

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitDashboard({
  data,
  greetingName,
  today,
  goals,
  onDeleteGoal,
  onToggleHabit,
}: {
  data: DashboardData;
  greetingName: string;
  today: string;
  goals?: { id: string; text: string }[];
  onDeleteGoal?: (id: string) => void;
  onToggleHabit?: (habitId: string, habitName: string) => void;
}) {
  const habits = data.habits ?? [];
  const todayLog = data.today_log ?? [];
  const weekRates = data.week_rates ?? [0, 0, 0, 0, 0, 0, 0];
  const name = greetingName.replace(/^,\s*/, "");
  const leavesThisWeek = weekRates.filter((r) => r > 0).length;
  const doneToday = habits.filter((h) => todayLog.includes(h.id)).length;
  const pendingToday = Math.max(habits.length - doneToday, 0);
  const todayRate = data.today_rate ?? 0;

  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (todayRate / 100) * ringCircumference;

  const dayLabels = VINE_POINTS.map((_, i) => {
    if (i === 6) return "today";
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return DAY_LETTERS[d.getDay()];
  });

  const vineLine =
    leavesThisWeek === 0
      ? "A fresh week — Let's plant the first leaf"
      : `The vine grew ${leavesThisWeek} ${leavesThisWeek === 1 ? "time" : "times"} this week`;

  return (
    <div className={`${inter.className} p-6 sm:p-10 relative min-h-full`}>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }}
      />

      <div className="relative z-10 max-w-3xl">
        {/* Greeting + two small, quiet stats */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className={`${caveat.className} text-3xl sm:text-4xl text-[#2C3E40] leading-none`}>
              {name ? `Hi ${name},` : "Hi there,"}
            </p>
            <p className="text-sm text-[#5A6B7A] mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 bg-white/80 text-[#2E5E4E] text-xs font-medium px-3 py-1.5 rounded-full">
              <Flame size={13} className="text-[#E8B84B]" /> {data.best_streak ?? 0} day streak
            </span>
            <span className="bg-white/80 text-[#2C3E40] text-xs font-medium px-3 py-1.5 rounded-full">
              {data.today_rate ?? 0}% today
            </span>
          </div>
        </div>

        {/* The vine */}
        <div className="bg-[#FAF7F0] rounded-3xl p-5 sm:p-6 mb-4">
          <p className={`${caveat.className} text-2xl text-[#2C3E40] leading-tight`}>{vineLine}</p>

          <svg viewBox="0 0 600 100" className="w-full block my-1" role="img" aria-label={`Vine with ${leavesThisWeek} leaves this week`}>
            <path
              d="M10 62 C 90 25, 170 88, 250 52 S 410 22, 490 56 S 570 72, 592 44"
              fill="none"
              stroke="#5C8A78"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {VINE_POINTS.map((p, i) =>
              weekRates[i] > 0 ? (
                <ellipse key={i} cx={p.x} cy={p.y} rx="11" ry="6" fill="#5C8A78" transform={`rotate(${p.r} ${p.x} ${p.y})`} />
              ) : (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="none" stroke="#B5A07A" strokeWidth="1.6" />
              )
            )}
            <circle cx={VINE_POINTS[6].x} cy={VINE_POINTS[6].y} r="17" fill="none" stroke="#E8C77A" strokeWidth="1.5" strokeDasharray="3 3" />
            {VINE_POINTS.map((p, i) => (
              <text key={i} x={p.x} y="95" fontSize="11" fill="#8A8478" textAnchor="middle">
                {dayLabels[i]}
              </text>
            ))}
          </svg>

          <p className="text-xs text-[#8A8478] mb-4">
            Missed days stay as little buds, not dead leaves. They&apos;re waiting, not broken.
          </p>

          {habits.length === 0 ? (
            <Link
              href="/dashboard/habits"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2E5E4E] bg-[#DDE9E1] px-4 py-2 rounded-full"
            >
              <Sprout size={15} /> Plant your first habit
            </Link>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {habits.map((h) => {
                const done = todayLog.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onToggleHabit?.(h.id, h.name)}
                    className={`inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full transition-colors ${
                      done ? "bg-[#DDE9E1] text-[#2E5E4E]" : "bg-[#F1ECE1] text-[#5E7473] hover:bg-[#E8E0CE]"
                    }`}
                  >
                    <Leaf size={14} /> {h.name}
                  </button>
                );
              })}
              <span className="text-xs text-[#8A8478] ml-1">
                {doneToday} of {habits.length} today
              </span>
              <Link href="/dashboard/habits" className="text-xs font-medium text-[#2E5E4E] ml-auto">
                Tend your habits →
              </Link>
            </div>
          )}
        </div>

        {/* "Rise noticed" as a sticky note, same style as the landing page */}
        {data.insight && (
          <div className="flex justify-end mb-6">
            <div
              className={`${caveat.className} bg-[#FBF0C8] text-[#4A5548] text-xl leading-snug px-4 py-3 rounded-md max-w-xs shadow-[0_6px_14px_rgba(0,0,0,0.10)]`}
              style={{ transform: "rotate(2deg)" }}
            >
              {data.insight}
            </div>
          </div>
        )}

        {/* A closer look — stat tiles, today's ring, and the week's graph */}
        <h2 className={`${playfair.className} text-xl text-[#2C3E40] mb-3`}>A closer look</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/80 rounded-2xl p-4">
            <CheckCircle2 size={16} className="text-[#5C8A78] mb-1.5" />
            <p className={`text-2xl ${playfair.className} text-[#2C3E40] leading-none`}>{doneToday}</p>
            <p className="text-xs text-[#8A8478] mt-1">done today</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4">
            <Clock size={16} className="text-[#B5A07A] mb-1.5" />
            <p className={`text-2xl ${playfair.className} text-[#2C3E40] leading-none`}>{pendingToday}</p>
            <p className="text-xs text-[#8A8478] mt-1">still waiting</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4">
            <Flame size={16} className="text-[#E8B84B] mb-1.5" />
            <p className={`text-2xl ${playfair.className} text-[#2C3E40] leading-none`}>{data.best_streak ?? 0}</p>
            <p className="text-xs text-[#8A8478] mt-1">day streak</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 mb-4">
          <div className="bg-white/80 rounded-3xl p-5 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="#EDE7DA" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="#5C8A78"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset 0.5s" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl ${playfair.className} text-[#2C3E40]`}>{todayRate}%</span>
              </div>
            </div>
            <p className={`${caveat.className} text-lg text-[#5E7473] mt-1`}>
              {todayRate === 100 ? "all done today!" : todayRate === 0 ? "the day's still open" : "getting there"}
            </p>
          </div>

          <div className="bg-white/80 rounded-3xl p-5">
            <p className={`${playfair.className} text-base text-[#2C3E40] mb-3`}>Your last 7 days</p>
            <div className="flex items-end justify-between gap-2 h-28">
              {weekRates.map((rate, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-[#8A8478]">{rate > 0 ? `${rate}%` : ""}</span>
                  <div
                    className={`w-full rounded-full ${i === 6 ? "bg-[#5C8A78]" : rate > 0 ? "bg-[#A9C4B6]" : "bg-[#EDE7DA]"}`}
                    style={{ height: `${Math.max(rate, 6)}%`, transition: "height 0.4s" }}
                  />
                  <span className="text-[10px] text-[#8A8478]">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals from onboarding — small and warm, not a system box */}
        {goals && goals.length > 0 && (
          <div className="bg-white/80 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-[#DDE9E1] flex items-center justify-center">
                <Target size={15} className="text-[#2E5E4E]" />
              </span>
              <div>
                <p className={`${playfair.className} text-base text-[#2C3E40] leading-tight`}>Your focus</p>
                <p className="text-[11px] text-[#8A8478]">still working toward</p>
              </div>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[#1E2A32]">{g.text}</p>
                  <button
                    onClick={() => onDeleteGoal?.(g.id)}
                    className="text-[#C9C4B8] hover:text-[#E0674F] flex-shrink-0 mt-0.5 transition-colors"
                    aria-label="Remove goal"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}