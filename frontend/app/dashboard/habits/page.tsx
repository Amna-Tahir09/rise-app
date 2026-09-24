// Save this as: app/dashboard/habits/page.tsx
//
// FIX: this page previously read its habit list from
// localStorage.getItem("rise_habits_list") — a value that was NEVER
// connected to the backend for reading (only saving worked). That's why
// habits disappeared on a fresh session while the backend-computed streak
// stayed correct. Now it loads from GET /dashboard/{user_id}, same as the
// dashboard itself.
//
// KNOWN REMAINING GAP: the dashboard endpoint only returns distinct habit
// names + today's done status — it doesn't return each habit's saved
// "time" or "note", since that endpoint was built for streak/list display,
// not full history. Those two fields will still reset to blank on reload
// for now. If you want them to persist too, that needs a small new backend
// endpoint returning full HabitLog rows, not just distinct names — happy
// to build that next if you want it.
//
// ALSO FLAGGING: the Delete button below only removes a habit from the
// current view — there's no backend "delete a habit" route yet, so it will
// reappear on next reload (the backend still has its history). Left the
// button in since removing it entirely felt like a bigger call to make
// without checking with you first — but as it stands it's misleading.
// Want a real DELETE route built for this?
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, X, SquareCheck } from "lucide-react";
import { useSignupGate } from "../_components/SignupGate";

type Habit = { id: string; name: string; time?: string; note?: string };

const todayKey = () => new Date().toISOString().slice(0, 10);
const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLog, setTodayLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();
  const { requireAccount, GateModal } = useSignupGate();

  const loadFromServer = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);
      const json = await res.json();
      // Backend's {id, name} pairs use id === name (the cleaned habit_name)
      setHabits((json.habits ?? []).map((h: { id: string; name: string }) => ({ id: h.id, name: h.name })));
      setTodayLog(json.today_log ?? []);
    } catch (err) {
      console.error("Failed to load habits from server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromServer();
  }, []);

  const resetForm = () => { setName(""); setTime(""); setNote(""); setEditingId(null); };
  const openNewForm = () => { resetForm(); setFormOpen(true); };
  const closeForm = () => { resetForm(); setFormOpen(false); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (requireAccount()) return;

    const cleanedName = name.trim().toLowerCase();
    closeForm();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habit-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          user_id: getUserId(),
          date: todayKey(),
          habits: [{ habit_name: cleanedName, done: false, note }],
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Habit-log sync failed:", res.status, errBody);
      }
    } catch (err) {
      console.error("Failed to sync habit to server:", err);
    } finally {
      loadFromServer();
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setName(habit.name);
    setTime(habit.time || "");
    setNote(habit.note || "");
    setFormOpen(true);
  };

  // See the file-header note above — this is view-only, not a real delete.
  const handleDelete = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (editingId === id) closeForm();
  };

  const toggleDone = async (habitId: string, habitName: string) => {
    if (requireAccount()) return;

    const isDone = todayLog.includes(habitId);
    const updated = isDone ? todayLog.filter((id) => id !== habitId) : [...todayLog, habitId];
    setTodayLog(updated);

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
      loadFromServer();
    }
  };

  const doneCount = habits.filter((h) => todayLog.includes(h.id)).length;

  if (loading) {
    return <div className="p-8 text-[#8A8478] text-sm">Loading your habits...</div>;
  }

  return (
    <div className="relative min-h-full">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/habits-bg1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto p-5 sm:p-8">
      <button onClick={() => router.push("/dashboard")} className="text-[#5A6B7A] text-sm mb-4 flex items-center gap-1 hover:text-[#1E2A32] transition-colors">
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif text-[#1E2A32] flex items-center gap-2">
            Habits Tracker <SquareCheck size={24} className="text-[#2E5E4E]" />
          </h1>
          <p className="text-sm text-[#5A6B7A] mt-1">{doneCount} of {habits.length} done today</p>
        </div>
        <button onClick={openNewForm} className="flex items-center gap-2 bg-[#2E5E4E] hover:bg-[#254D40] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors">
          <Plus size={16} /> Add habit
        </button>
      </div>

      {formOpen && (
        <div className="bg-white border-2 border-[#2E5E4E] rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#1E2A32]">{editingId ? "Edit habit" : "New habit"}</p>
            <button onClick={closeForm} className="text-[#8A8478] hover:text-[#1E2A32] transition-colors">
              <X size={18} />
            </button>
          </div>
          <label className="block text-xs font-semibold text-[#5A6B7A] mb-1.5">Name</label>
          <input id="habit-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning walk" className="w-full bg-[#F4F1EA] border border-[#E5E0D5] px-3.5 py-2.5 rounded-xl text-sm mb-3.5 focus:outline-none focus:border-[#2E5E4E]" />
          <label className="block text-xs font-semibold text-[#5A6B7A] mb-1.5">Time (optional — not yet saved to your account)</label>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 7:00 AM" className="w-full bg-[#F4F1EA] border border-[#E5E0D5] px-3.5 py-2.5 rounded-xl text-sm mb-3.5 focus:outline-none focus:border-[#2E5E4E]" />
          <label className="block text-xs font-semibold text-[#5A6B7A] mb-1.5">Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 20 minutes minimum" className="w-full bg-[#F4F1EA] border border-[#E5E0D5] px-3.5 py-2.5 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#2E5E4E]" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-[#2E5E4E] hover:bg-[#254D40] text-white rounded-full py-2.5 font-semibold text-sm transition-colors">
              {editingId ? "Save changes" : "Add habit"}
            </button>
            {editingId && (
              <button onClick={() => handleDelete(editingId)} className="px-5 border border-[#E0674F]/40 text-[#E0674F] rounded-full text-sm font-semibold hover:bg-[#E0674F]/5 transition-colors">
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-14 text-[#8A8478]"><p className="text-sm mb-3">No habits yet</p></div>
      ) : (
        habits.map((habit) => {
          const isDone = todayLog.includes(habit.id);
          return (
            <div key={habit.id} className={`flex items-center justify-between p-4 rounded-2xl border mb-2.5 transition-colors ${isDone ? "border-[#2E5E4E] bg-[#2E5E4E]/5" : "border-[#E5E0D5] bg-white"}`}>
              <button onClick={() => toggleDone(habit.id, habit.name)} className="flex items-center gap-3 flex-1 text-left">
                <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 ${isDone ? "bg-[#2E5E4E] border-[#2E5E4E]" : "border-[#C9C4B8]"}`} />
                <div>
                  <div className="text-sm text-[#1E2A32]">{habit.name}</div>
                  {habit.note && <div className="text-xs text-[#8A8478] mt-0.5">{habit.note}</div>}
                </div>
              </button>
              <div className="flex items-center gap-3">
                {habit.time && <span className="text-xs text-[#8A8478]">{habit.time}</span>}
                <button onClick={() => handleEdit(habit)} className="text-[#C9C4B8] hover:text-[#2E5E4E]"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(habit.id)} className="text-[#C9C4B8] hover:text-[#E0674F]"><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })
      )}
      </div>
      <GateModal />
    </div>
  );
}