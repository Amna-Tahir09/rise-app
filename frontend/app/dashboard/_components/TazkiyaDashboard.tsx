"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Moon, Activity, Shield, MessageCircle, CheckCircle2, Target, Sparkles, X } from "lucide-react";

const SALAH = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

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
  const salahToday = data.salah_today ?? [];
  const severeNafs = data.severe_nafs ?? [];

  const handleInsightCta = () => {
    if (!data.insight?.ctaHref) return;
    if (data.insight.chatPrefill) {
      localStorage.setItem("rise_chat_prefill", data.insight.chatPrefill);
    }
    router.push(data.insight.ctaHref);
  };

  return (
    <div className="p-6 sm:p-10 relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.8,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2C3E40]">Welcome back{greetingName}</h1>
            <p className="text-sm text-[#5E7473] mt-1">{today}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-[#DCE4DC] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#5E7473] flex items-center justify-center gap-1">
                <Flame size={11} className="text-[#D6C6A8]" /> TAWBAH STREAK
              </p>
              <p className="text-lg font-serif text-[#2C3E40]">{data.muhasaba_streak ?? 0} Days</p>
            </div>
            <div className="bg-white border border-[#DCE4DC] rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] tracking-wide text-[#5E7473]">TODAY</p>
              <p className="text-lg font-serif text-[#2C3E40] flex items-center gap-1 justify-center">
                {data.muhasaba_today && <CheckCircle2 size={14} className="text-[#2E5E4E]" />}
                {data.muhasaba_today ? "Done" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {((goals && goals.length > 0) || salahToday.length > 0) && (
          <div className="bg-white border border-[#DCE4DC] rounded-2xl p-4 mb-4">
            {goals && goals.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-[#2E5E4E]" />
                  <p className="text-[10px] tracking-wide text-[#5E7473] uppercase">Your focus</p>
                </div>
                <div className="space-y-2">
                  {goals.map((g) => (
                    <div key={g.id} className="flex items-start justify-between gap-2 bg-[#EAF0E8] rounded-xl px-3 py-2">
                      <p className="text-sm text-[#2C3E40]">{g.text}</p>
                      <button
                        onClick={() => onDeleteGoal?.(g.id)}
                        className="text-[#B5A07A] hover:text-[#E0674F] flex-shrink-0 mt-0.5 transition-colors"
                        aria-label="Delete goal"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className={`flex items-center gap-2 ${goals && goals.length > 0 ? "border-t border-[#F0EDE6] pt-3 mt-3" : ""}`}>
              <Moon size={14} className="text-[#D6C6A8]" />
              <p className="text-sm text-[#2C3E40]">
                Salah today: <span className="font-semibold">{salahToday.length}/5</span>
              </p>
            </div>
          </div>
        )}

        {/* Salah quick-log — tap to mark today's prayers. Synced to the
            backend via /muhasaba-log (log_type "salah") so it's real,
            cross-device data, not a local-only counter. */}
        <div className="bg-white border border-[#DCE4DC] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-wide text-[#5E7473] uppercase">Salah today</p>
            <p className="text-sm font-serif text-[#2C3E40]">{salahToday.length}/5</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SALAH.map((s) => {
              const done = salahToday.includes(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => onToggleSalah?.(s.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    done
                      ? "bg-[#2E5E4E] text-white border-[#2E5E4E]"
                      : "bg-white text-[#5E7473] border-[#DCE4DC] hover:border-[#2E5E4E]/40"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currently-high nafs ratings — a standing summary, not just a
            rotating single insight sentence. */}
        {severeNafs.length > 0 && (
          <div className="bg-[#FDEDEA] border border-[#E0674F]/30 rounded-2xl p-4 mb-4">
            <p className="text-[10px] tracking-wide text-[#A14C36] uppercase mb-2">Currently high</p>
            <div className="flex flex-wrap gap-2">
              {severeNafs.map((n) => (
                <span
                  key={n.key}
                  className="text-xs font-semibold bg-white text-[#A14C36] px-3 py-1 rounded-full border border-[#E0674F]/30"
                >
                  {n.label} · {n.value}/5
                </span>
              ))}
            </div>
          </div>
        )}

        {data.insight && (
          <div className="bg-[#FBF3E0] border border-[#E8B84B]/40 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-[#C99A2E] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] tracking-wide text-[#8A6D2F] uppercase mb-0.5">Rise noticed</p>
                <p className="text-sm text-[#4A4536]">{data.insight.text}</p>
                {data.insight.ctaLabel && (
                  <button
                    onClick={handleInsightCta}
                    className="text-xs font-semibold text-[#8A6D2F] mt-2 underline hover:text-[#4A4536] transition-colors"
                  >
                    {data.insight.ctaLabel} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2C3E40] rounded-2xl p-6 mb-6">
          <p className="text-xs text-[#D6C6A8] mb-2">Wisdom of the day</p>
          <p className="text-lg font-serif italic text-white">The one who reflects on their soul each night purifies it before it hardens.</p>
        </div>

        <Link
          href="/dashboard/muhasaba"
          className="block bg-[#2E5E4E] hover:bg-[#254D40] rounded-2xl p-6 mb-6 transition-colors"
        >
          <p className="text-xs text-[#B7D4C6] mb-1">
            {data.muhasaba_today ? "You've already reflected today" : "Today's next step"}
          </p>
          <p className="text-xl font-serif text-white flex items-center gap-2">
            {data.muhasaba_today ? "Revisit today's reflection" : "Start today's reflection"}
            <Moon size={20} />
          </p>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/nafs" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Activity size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Nafs Tracker</h3>
            <p className="text-xs text-[#5E7473] mt-1">Check your inner state</p>
          </Link>
          <Link href="/dashboard/tawbah" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Shield size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Tawbah</h3>
            <p className="text-xs text-[#5E7473] mt-1">Return and repent</p>
          </Link>
          <Link href="/dashboard/chat" className="bg-white border border-[#DCE4DC] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <MessageCircle size={22} className="text-[#D6C6A8] mb-3" />
            <h3 className="font-semibold text-[#2C3E40]">Ask Rise</h3>
            <p className="text-xs text-[#5E7473] mt-1">Ask why a struggle keeps returning</p>
            <span className="text-xs font-semibold text-[#2C3E40] mt-2 inline-block">Open chat →</span>
          </Link>
        </div>
      </div>

      <Link
        href="/dashboard/chat"
        className="fixed bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-[#2C3E40] text-white flex items-center justify-center shadow-lg hover:bg-[#233033] transition-colors"
      >
        <MessageCircle size={20} />
      </Link>
    </div>
  );
}