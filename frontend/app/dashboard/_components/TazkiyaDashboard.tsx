// Save this as: app/dashboard/_components/TazkiyaDashboard.tsx
//
// REDESIGN: "The night sky." Salah becomes the moon filling up through the
// day (Fajr a thin crescent, Isha the full moon). Reflection streak shows
// as stars, one per night. A high nafs rating is named gently as a cloud,
// with a way to talk it through, instead of a red alert box. Same props
// and same backend data as before (salah_today, muhasaba_streak,
// severe_nafs, insight, goals), so dashboard/page.tsx needs no changes.
//
// Also removed: this component used to render its own floating chat
// button, duplicating the one already in dashboard/layout.tsx.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caveat, Playfair_Display, Inter } from "next/font/google";
import { Cloud, Activity, Shield, MessageCircle, X, Target, ArrowRight } from "lucide-react";

const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600"] });
// Three-font system, matching the landing page:
// Playfair Display for headings and numbers, Inter for body text,
// Caveat only for personal, handwritten moments.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

type TazkiyaInsight = {
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  chatPrefill?: string;
};

type DashboardData = {
  muhasaba_today?: boolean;
  muhasaba_streak?: number;
  insight?: TazkiyaInsight | null;
  salah_today?: string[];
  severe_nafs?: { key: string; label: string; value: number }[];
};

// Each prayer is a moon phase, waxing from Fajr to a full moon at Isha
const SALAH_MOONS = [
  { key: "fajr", label: "Fajr", path: "M15 3 A12 12 0 0 1 15 27 A7 12 0 0 0 15 3Z" },
  { key: "dhuhr", label: "Dhuhr", path: "M15 3 A12 12 0 0 1 15 27 Z" },
  { key: "asr", label: "Asr", path: "M15 3 A12 12 0 0 1 15 27 A6 12 0 0 1 15 3Z" },
  { key: "maghrib", label: "Maghrib", path: "M15 3 A12 12 0 0 1 15 27 A10 12 0 0 1 15 3Z" },
  { key: "isha", label: "Isha", path: null },
];

const STARS = [
  { x: 40, y: 12, r: 1.8 }, { x: 95, y: 28, r: 1.4 }, { x: 150, y: 10, r: 2 },
  { x: 205, y: 24, r: 1.5 }, { x: 260, y: 8, r: 1.8 }, { x: 315, y: 26, r: 1.3 },
  { x: 370, y: 14, r: 1.7 }, { x: 425, y: 30, r: 1.4 }, { x: 480, y: 10, r: 1.9 },
  { x: 530, y: 24, r: 1.4 }, { x: 570, y: 8, r: 1.6 }, { x: 590, y: 30, r: 1.3 },
];

export default function TazkiyaDashboard({
  data,
  greetingName,
  today,
  goals,
  onDeleteGoal,
  onToggleSalah,
}: {
  data: DashboardData;
  greetingName: string;
  today: string;
  goals?: { id: string; text: string }[];
  onDeleteGoal?: (id: string) => void;
  onToggleSalah?: (prayerKey: string) => void;
}) {
  const router = useRouter();
  const name = greetingName.replace(/^,\s*/, "");
  const streak = data.muhasaba_streak ?? 0;
  const salahToday = data.salah_today ?? [];
  const severeNafs = data.severe_nafs ?? [];
  const litStars = Math.min(streak, STARS.length);

  const openChatWith = (prefill: string) => {
    router.push(`/dashboard/chat?q=${encodeURIComponent(prefill)}`);
  };

  const moonLine =
    salahToday.length === 5
      ? "Full moon tonight. Every prayer, today."
      : salahToday.length === 0
      ? "The moon's still new today. Fajr starts it."
      : `The moon's ${salahToday.length}/5 full today. It completes at Isha.`;

  const topNafs = severeNafs[0];
  const topNafsName = topNafs ? topNafs.label.split(" (")[1]?.replace(")", "") || topNafs.label : "";

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
        <p className="text-sm text-[#5E7473] mb-3">{today}</p>

        {/* The night sky */}
        <div className="bg-[#2C3E40] rounded-3xl p-5 sm:p-6 mb-4 relative overflow-hidden">
          <svg viewBox="0 0 600 40" className="w-full block absolute top-2 left-0" aria-hidden="true">
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F1ECE1" opacity={i < litStars ? 1 : 0.18} />
            ))}
          </svg>

          <p className={`${caveat.className} text-3xl text-[#F1ECE1] leading-tight mt-6`}>
            assalamu alaikum{name ? `, ${name}` : ""}
          </p>
          <p className="text-xs text-[#9CB5AE] mb-5">
            {streak === 0
              ? "A quiet sky tonight. Your first reflection lights the first star."
              : `${streak} ${streak === 1 ? "night" : "nights"} of reflection — each star is a night you sat with yourself.`}
          </p>

          <div className="flex justify-between max-w-md">
            {SALAH_MOONS.map((m) => {
              const prayed = salahToday.includes(m.key);
              const lit = prayed ? "#E8C77A" : "#4F6668";
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onToggleSalah?.(m.key)}
                  className="flex flex-col items-center gap-1"
                  aria-label={`${m.label} ${prayed ? "prayed" : "not yet prayed"}`}
                >
                  <svg width="34" height="34" viewBox="0 0 30 30">
                    {m.path ? (
                      <>
                        <circle cx="15" cy="15" r="12" fill="#3E5456" />
                        <path d={m.path} fill={lit} style={{ transition: "fill 0.3s" }} />
                      </>
                    ) : (
                      <circle cx="15" cy="15" r="12" fill={lit} style={{ transition: "fill 0.3s" }} />
                    )}
                  </svg>
                  <span className="text-[11px] text-[#D6C6A8]">{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-[#F1ECE1] mt-4">{moonLine}</p>

          {topNafs && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F1ECE1]/10">
              <Cloud size={18} className="text-[#9CB5AE] flex-shrink-0" />
              <p className="text-sm text-[#D6C6A8] flex-1">
                A little {topNafsName.toLowerCase()} has been clouding things lately.
              </p>
              <button
                onClick={() =>
                  openChatWith(`I've been struggling with ${topNafsName.toLowerCase()} lately — can you help me understand it?`)
                }
                className="text-xs text-[#F1ECE1] border border-[#F1ECE1]/30 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors"
              >
                Talk it through
              </button>
            </div>
          )}
        </div>

        {/* Other gentle insights (salah trend, consistency) as a sticky note */}
        {!topNafs && data.insight && (
          <div className="flex justify-end mb-5">
            <button
              type="button"
              onClick={() => data.insight?.chatPrefill && openChatWith(data.insight.chatPrefill)}
              className={`${caveat.className} text-left bg-[#FBF0C8] text-[#4A5548] text-xl leading-snug px-4 py-3 rounded-md max-w-xs shadow-[0_6px_14px_rgba(0,0,0,0.10)]`}
              style={{ transform: "rotate(-2deg)", cursor: data.insight.chatPrefill ? "pointer" : "default" }}
            >
              {data.insight.text}
            </button>
          </div>
        )}

        {/* Tonight's reflection — warm dusk colors, the day's main invitation */}
        <Link
          href="/dashboard/muhasaba"
          className="group relative block overflow-hidden rounded-3xl px-6 py-5 mb-4 transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(120deg, #E8C77A 0%, #D9A86C 45%, #B5796A 100%)" }}
        >
          <svg className="absolute -right-4 -top-6 opacity-25" width="130" height="130" viewBox="0 0 30 30" aria-hidden="true">
            <path d="M15 3 A12 12 0 0 1 15 27 A7 12 0 0 0 15 3Z" fill="#FFF8E7" />
          </svg>
          <p className={`${caveat.className} text-xl text-[#4A3325]`}>
            {data.muhasaba_today ? "you've already sat with today" : "when you're ready tonight"}
          </p>
          <div className="flex items-center justify-between gap-3 relative">
            <p className={`${playfair.className} text-2xl text-[#2C2018] leading-snug`}>
              {data.muhasaba_today ? "Revisit your reflection" : "Sit with today's reflection"}
            </p>
            <span className="w-9 h-9 rounded-full bg-[#2C3E40] text-[#F1ECE1] flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </div>
          <p className="text-xs text-[#4A3325]/80 mt-1 relative">
            Five gentle questions. A few minutes. Just for you.
          </p>
        </Link>

        {goals && goals.length > 0 && (
          <div className="bg-white/80 rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-[#F3E6C4] flex items-center justify-center">
                <Target size={15} className="text-[#8A6D2F]" />
              </span>
              <div>
                <p className={`${playfair.className} text-base text-[#2C3E40] leading-tight`}>Your focus</p>
                <p className="text-[11px] text-[#8A8478]">still working on</p>
              </div>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[#2C3E40]">{g.text}</p>
                  <button
                    onClick={() => onDeleteGoal?.(g.id)}
                    className="text-[#C9C4B8] hover:text-[#E0674F] flex-shrink-0 mt-0.5 transition-colors"
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Small, quiet doors to the rest */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/dashboard/nafs" className="bg-white/80 hover:bg-white rounded-2xl p-4 transition-colors">
            <Activity size={18} className="text-[#B5A07A] mb-2" />
            <p className={`${playfair.className} text-base text-[#2C3E40]`}>Nafs check</p>
          </Link>
          <Link href="/dashboard/tawbah" className="bg-white/80 hover:bg-white rounded-2xl p-4 transition-colors">
            <Shield size={18} className="text-[#B5A07A] mb-2" />
            <p className={`${playfair.className} text-base text-[#2C3E40]`}>Tawbah</p>
          </Link>
          <Link href="/dashboard/chat" className="bg-white/80 hover:bg-white rounded-2xl p-4 transition-colors">
            <MessageCircle size={18} className="text-[#B5A07A] mb-2" />
            <p className={`${playfair.className} text-base text-[#2C3E40]`}>Ask Rise</p>
          </Link>
        </div>
      </div>
    </div>
  );
}