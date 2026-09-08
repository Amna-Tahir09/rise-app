"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, Plus, Trash2, X, Pencil, ArrowLeft } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  time?: string;
  note?: string;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLog, setTodayLog] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const list: Habit[] = JSON.parse(localStorage.getItem("rise_habits_list") || "[]");
    setHabits(list);
    const log: string[] = JSON.parse(localStorage.getItem(`rise_habit_log_${todayKey()}`) || "[]");
    setTodayLog(log);
  }, []);

  const saveHabits = (list: Habit[]) => {
    setHabits(list);
    localStorage.setItem("rise_habits_list", JSON.stringify(list));
  };

  const toggleHabit = (id: string) => {
    const updated = todayLog.includes(id)
      ? todayLog.filter((h) => h !== id)
      : [...todayLog, id];
    setTodayLog(updated);
    localStorage.setItem(`rise_habit_log_${todayKey()}`, JSON.stringify(updated));
  };

  const openAddForm = () => {
    setEditingId(null);
    setNameInput("");
    setTimeInput("");
    setNoteInput("");
    setShowForm(true);
  };

  const openEditForm = (habit: Habit) => {
    setEditingId(habit.id);
    setNameInput(habit.name);
    setTimeInput(habit.time || "");
    setNoteInput(habit.note || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!nameInput.trim()) return;

    if (editingId) {
      const updated = habits.map((h) =>
        h.id === editingId
          ? { ...h, name: nameInput.trim(), time: timeInput.trim() || undefined, note: noteInput.trim() || undefined }
          : h
      );
      saveHabits(updated);
    } else {
      const habit: Habit = {
        id: crypto.randomUUID(),
        name: nameInput.trim(),
        time: timeInput.trim() || undefined,
        note: noteInput.trim() || undefined,
      };
      saveHabits([...habits, habit]);
    }

    closeForm();
  };

  const deleteHabit = (id: string) => {
    saveHabits(habits.filter((h) => h.id !== id));
    const updatedLog = todayLog.filter((h) => h !== id);
    setTodayLog(updatedLog);
    localStorage.setItem(`rise_habit_log_${todayKey()}`, JSON.stringify(updatedLog));
    if (editingId === id) closeForm();
  };

  const completedCount = todayLog.length;

  return (
    <div className="max-w-2xl mx-auto w-full px-1 sm:px-0">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#3C6E7A] transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 flex items-center gap-2">
            Habits Tracker <CheckSquare size={20} className="text-[#3C6E7A]" />
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {completedCount} of {habits.length} done today
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 bg-[#3C6E7A] hover:bg-[#2C5560] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          Add habit
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 mb-6 relative">
          <button
            onClick={closeForm}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
          >
            <X size={18} />
          </button>
          <h3 className="text-sm font-semibold text-stone-800 mb-4">
            {editingId ? "Edit habit" : "New habit"}
          </h3>

          <label className="block text-xs font-semibold text-stone-600 mb-1">Name</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Morning walk"
            className="w-full bg-stone-100 border border-stone-200 p-3 rounded-xl mb-4 outline-none focus:border-[#3C6E7A] text-stone-800"
          />

          <label className="block text-xs font-semibold text-stone-600 mb-1">Time (optional)</label>
          <input
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            placeholder="e.g. 7:00 AM"
            className="w-full bg-stone-100 border border-stone-200 p-3 rounded-xl mb-4 outline-none focus:border-[#3C6E7A] text-stone-800"
          />

          <label className="block text-xs font-semibold text-stone-600 mb-1">Note (optional)</label>
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="e.g. 20 minutes minimum"
            className="w-full bg-stone-100 border border-stone-200 p-3 rounded-xl mb-5 outline-none focus:border-[#3C6E7A] text-stone-800"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-2.5 rounded-full flex-1 font-semibold transition-colors"
            >
              {editingId ? "Save changes" : "Add habit"}
            </button>
            {editingId && (
              <button
                onClick={() => deleteHabit(editingId)}
                className="text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-full font-semibold transition-colors border border-red-200"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#3C6E7A]/10 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="text-[#3C6E7A]" size={22} />
          </div>
          <p className="text-stone-700 font-medium mb-1">No habits yet</p>
          <p className="text-stone-400 text-sm mb-5">Start with one small habit you want to build.</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#3C6E7A] hover:bg-[#2C5560] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <Plus size={16} />
            Add your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const done = todayLog.includes(habit.id);
            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  done ? "border-[#3C6E7A] bg-[#3C6E7A]/5" : "border-stone-200 bg-white"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleHabit(habit.id)}
                    className="w-5 h-5 accent-[#3C6E7A] flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${done ? "text-stone-900 font-medium" : "text-stone-700"}`}>
                      {habit.name}
                    </p>
                    {habit.note && <p className="text-xs text-stone-400 truncate">{habit.note}</p>}
                  </div>
                </label>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {habit.time && <span className="hidden sm:inline text-xs text-stone-400">{habit.time}</span>}
                  <button
                    onClick={() => openEditForm(habit)}
                    className="text-stone-300 hover:text-[#3C6E7A] transition-colors"
                    aria-label="Edit habit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                    aria-label="Delete habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}