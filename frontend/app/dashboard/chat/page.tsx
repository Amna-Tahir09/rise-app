// Save this as: app/dashboard/chat/page.tsx
//
// CHANGES:
// - Chats are saved in the database (not browser storage), so past chats
//   show up on any device.
// - "Past chats" list: tap any earlier conversation to reopen it.
// - "New chat" button starts a fresh conversation any time.
// - Each new day opens a fresh chat automatically; yesterday's stays saved
//   in the list.
// - A suggested question from the dashboard now arrives through the page
//   link (?q=...), not browser storage.
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Send, Plus, History, Trash2, X } from "lucide-react";
import { useSignupGate } from "../_components/SignupGate";

type Message = { role: "user" | "assistant"; content: string };
type ChatSession = { id: number; title: string | null; date: string };

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";
const API = process.env.NEXT_PUBLIC_API_URL;

const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayLabel = (iso: string) => {
  if (iso === localDate()) return "Today";
  if (iso === localDate(-1)) return "Yesterday";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const GREETING: Message = {
  role: "assistant",
  content: "Salaam! I'm here to help you think through your habits or reflections. What's on your mind today?",
};

function renderMessageContent(content: string) {
  const normalized = content.replace(/\s+-\s+\*\*/g, "\n- **");
  const lines = normalized.split("\n").filter((l) => l.trim() !== "");
  const renderInline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
    );
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) listBuffer.push(trimmed.slice(2));
    else {
      flushList();
      elements.push(<p key={`p-${elements.length}`} className="mb-1.5 last:mb-0">{renderInline(trimmed)}</p>);
    }
  });
  flushList();
  return elements;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [startFresh, setStartFresh] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requireAccount, GateModal } = useSignupGate();

  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const loadSessions = async (): Promise<ChatSession[]> => {
    if (!getUserId()) return [];
    try {
      const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Sessions fetch failed (${res.status})`);
      const list: ChatSession[] = await res.json();
      setSessions(list);
      return list;
    } catch (err) {
      console.error("Failed to load chats:", err);
      return [];
    }
  };

  const openSession = async (id: number) => {
    setActiveId(id);
    setStartFresh(false);
    setShowList(false);
    try {
      const res = await fetch(`${API}/chat/sessions/${id}/messages`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Messages fetch failed (${res.status})`);
      setMessages(await res.json());
    } catch (err) {
      console.error("Failed to open chat:", err);
      setMessages([]);
    }
  };

  const startNewChat = () => {
    setActiveId(null);
    setStartFresh(true);
    setMessages([]);
    setShowList(false);
  };

  useEffect(() => {
    (async () => {
      const list = await loadSessions();
      const todays = list.find((s) => s.date === localDate());
      if (todays) await openSession(todays.id);
    })();

    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setInput(q);

    const handleUpdate = () => {
      loadSessions();
    };
    window.addEventListener("rise-chat-updated", handleUpdate);
    return () => window.removeEventListener("rise-chat-updated", handleUpdate);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (requireAccount()) return;

    const question = input;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      let sessionId = activeId;
      if (!sessionId && startFresh) {
        const created = await fetch(`${API}/chat/sessions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ date: localDate() }),
        });
        if (created.ok) sessionId = (await created.json()).id;
      }

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ user_id: Number(getUserId()), question, session_id: sessionId, date: localDate() }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setActiveId(data.session_id);
      setStartFresh(false);
      setMessages((m) => [...m, { role: "assistant", content: data.answer || "..." }]);
      loadSessions();
      window.dispatchEvent(new Event("rise-chat-updated"));
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't reach the server just now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: number) => {
    const previous = sessions;
    setSessions((s) => s.filter((x) => x.id !== id));
    if (activeId === id) startNewChat();
    try {
      const res = await fetch(`${API}/chat/sessions/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) setSessions(previous);
    } catch {
      setSessions(previous);
    }
  };

  const visibleMessages = messages.length === 0 ? [GREETING] : messages;

  const sessionList = (
    <div className="flex flex-col h-full">
      <button
        onClick={startNewChat}
        className="flex items-center justify-center gap-2 bg-[#2E5E4E] hover:bg-[#254D40] text-white rounded-full py-2.5 text-sm font-semibold transition-colors mb-4"
      >
        <Plus size={16} /> New chat
      </button>
      <p className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase mb-2">Past chats</p>
      {sessions.length === 0 ? (
        <p className="text-xs text-[#8A8478]">Your conversations will be saved here.</p>
      ) : (
        <div className="space-y-1 overflow-y-auto flex-1 pr-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                activeId === s.id ? "bg-[#2E5E4E]/10" : "hover:bg-[#F4F1EA]"
              }`}
              onClick={() => openSession(s.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#1E2A32] truncate">{s.title || "New conversation"}</p>
                <p className="text-[11px] text-[#8A8478]">{dayLabel(s.date)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                className="text-[#C9C4B8] hover:text-[#E0674F] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url('/habits-bg.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15 }}
      />
      <div className="relative z-10 max-w-5xl mx-auto p-5 sm:p-8 flex flex-col h-screen">
        <button onClick={() => router.push("/dashboard")} className="text-[#5A6B7A] text-sm mb-3 flex items-center gap-1 hover:text-[#1E2A32] transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2">
              Ask Rise <MessageCircle size={20} className="text-[#2E5E4E]" />
            </h1>
            <p className="text-sm text-[#5A6B7A] mb-1">Talk through what&apos;s on your mind.</p>
            <p className="text-xs text-[#8A8478] mb-4">
              Grounded in your own logs and public-domain classical texts — not a substitute for a qualified scholar or a mental health professional.
            </p>
          </div>
          <button
            onClick={() => setShowList(true)}
            className="md:hidden flex items-center gap-1.5 text-sm text-[#2E5E4E] bg-white border border-[#E5E0D5] rounded-full px-3 py-1.5 flex-shrink-0"
          >
            <History size={14} /> Chats
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <aside className="hidden md:block w-60 flex-shrink-0 bg-white border border-[#E5E0D5] rounded-3xl p-4">{sessionList}</aside>

          <div className="flex-1 bg-white border border-[#E5E0D5] rounded-3xl p-5 flex flex-col overflow-hidden min-w-0">
            <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3.5 pr-1">
              {visibleMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user" ? "bg-[#2E5E4E] text-white rounded-br-md" : "bg-[#F4F1EA] text-[#1E2A32] rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? renderMessageContent(m.content) : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F4F1EA] text-[#8A8478] px-4 py-3 rounded-2xl rounded-bl-md text-sm">Thinking...</div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4 pt-4 border-t border-[#F0EDE6]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-[#F4F1EA] border border-[#E5E0D5] px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#2E5E4E]"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="w-11 h-11 rounded-full bg-[#2E5E4E] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showList && (
        <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setShowList(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowList(false)} className="self-end text-[#8A8478] mb-2" aria-label="Close">
              <X size={18} />
            </button>
            {sessionList}
          </div>
        </div>
      )}
      <GateModal />
    </div>
  );
}