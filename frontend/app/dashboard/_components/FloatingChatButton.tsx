// Save this as: app/dashboard/_components/FloatingChatButton.tsx
//
// CHANGES: no more browser-stored chat history. The floating chat now
// shows today's saved conversation from the database — the same one the
// full chat page opens — so both stay in sync, on any device. A link at
// the top opens the full page with all past chats.
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { useSignupGate } from "./SignupGate";

type Message = { role: "user" | "assistant"; content: string };
type ChatSession = { id: number; title: string | null; date: string };

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";
const API = process.env.NEXT_PUBLIC_API_URL;

const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const GREETING: Message = { role: "assistant", content: "Salaam! Ask me anything about your habits or reflections." };

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

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requireAccount, GateModal } = useSignupGate();

  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const loadToday = async () => {
    if (!getUserId() || !getToken()) return;
    try {
      const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
      if (!res.ok) return;
      const list: ChatSession[] = await res.json();
      const todays = list.find((s) => s.date === localDate());
      if (!todays) {
        setSessionId(null);
        setMessages([]);
        return;
      }
      setSessionId(todays.id);
      const msgRes = await fetch(`${API}/chat/sessions/${todays.id}/messages`, { headers: authHeaders() });
      if (msgRes.ok) setMessages(await msgRes.json());
    } catch (err) {
      console.error("Failed to load today's chat:", err);
    }
  };

  useEffect(() => {
    if (open) loadToday();
  }, [open]);

  useEffect(() => {
    const handleUpdate = () => {
      if (open) loadToday();
    };
    window.addEventListener("rise-chat-updated", handleUpdate);
    return () => window.removeEventListener("rise-chat-updated", handleUpdate);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (requireAccount()) return;

    const question = input;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
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
      setSessionId(data.session_id);
      setMessages((m) => [...m, { role: "assistant", content: data.answer || "..." }]);
      window.dispatchEvent(new Event("rise-chat-updated"));
    } catch (err) {
      console.error("Floating chat request failed:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't reach the server just now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const visibleMessages = messages.length === 0 ? [GREETING] : messages;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#4B6E6D] text-white shadow-lg flex items-center justify-center z-40 hover:bg-[#3A5654] transition-colors"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[92vw] sm:w-96 h-[70vh] max-h-[560px] bg-white border border-[#DCE4DC] rounded-3xl shadow-2xl flex flex-col z-40 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EDE6]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#4B6E6D]" />
                <span className="text-sm font-semibold text-[#2C3E40]">Ask Rise · today</span>
              </div>
              <Link href="/dashboard/chat" onClick={() => setOpen(false)} className="text-xs font-semibold text-[#4B6E6D]">
                All chats →
              </Link>
            </div>
            <p className="text-[10px] text-[#8DA0A0] mt-1 leading-snug">
              Grounded in your logs and classical texts — not a substitute for a scholar or professional.
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {visibleMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user" ? "bg-[#4B6E6D] text-white rounded-br-md" : "bg-[#EAF0E8] text-[#2C3E40] rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? renderMessageContent(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && <div className="bg-[#EAF0E8] text-[#8DA0A0] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm w-fit">Thinking...</div>}
          </div>

          <div className="flex gap-2 p-3 border-t border-[#F0EDE6]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#EAF0E8] border border-[#DCE4DC] px-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-[#4B6E6D]"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#4B6E6D] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <GateModal />
    </>
  );
}