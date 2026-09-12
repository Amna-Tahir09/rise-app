"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useSignupGate } from "./SignupGate";

type Message = { role: "user" | "assistant"; content: string };

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

// Same lightweight markdown renderer as the main chat page — kept in sync so
// both surfaces render bold text and bullet lists identically.
function renderMessageContent(content: string) {
  const normalized = content.replace(/\s+-\s+\*\*/g, "\n- **");
  const lines = normalized.split("\n").filter((l) => l.trim() !== "");

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

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
    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
    } else {
      flushList();
      elements.push(<p key={`p-${elements.length}`} className="mb-1.5 last:mb-0">{renderInline(trimmed)}</p>);
    }
  });
  flushList();

  return elements;
}

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requireAccount, GateModal } = useSignupGate();

  useEffect(() => {
    const load = () => {
      const saved = JSON.parse(localStorage.getItem("rise_chat_history") || "[]");
      setMessages(
        saved.length ? saved : [{ role: "assistant", content: "Salaam! Ask me anything about your habits or reflections." }]
      );
    };
    load();
    window.addEventListener("rise-chat-updated", load);
    return () => window.removeEventListener("rise-chat-updated", load);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (requireAccount()) return; // guests get the signup prompt instead of a real request

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    localStorage.setItem("rise_chat_history", JSON.stringify(updated));
    window.dispatchEvent(new Event("rise-chat-updated"));
    setInput("");
    setLoading(true);

    // Backend contract (FastAPI ChatRequest): { user_id: int, question: str }
    // returns { answer: string, sources_used: int }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ user_id: getUserId(), question: userMsg.content }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const reply: Message = { role: "assistant", content: data.answer || "..." };
      const withReply = [...updated, reply];
      setMessages(withReply);
      localStorage.setItem("rise_chat_history", JSON.stringify(withReply));
      window.dispatchEvent(new Event("rise-chat-updated"));
    } catch (err) {
      console.error("Floating chat request failed:", err);
      const errReply: Message = { role: "assistant", content: "Sorry, I couldn't reach the server just now. Please try again." };
      const withErr = [...updated, errReply];
      setMessages(withErr);
      localStorage.setItem("rise_chat_history", JSON.stringify(withErr));
      window.dispatchEvent(new Event("rise-chat-updated"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#4B6E6D] text-white shadow-lg flex items-center justify-center z-40 hover:bg-[#3A5654] transition-colors"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[92vw] sm:w-96 h-[70vh] max-h-[560px] bg-white border border-[#DCE4DC] rounded-3xl shadow-2xl flex flex-col z-40 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EDE6] flex items-center gap-2">
            <MessageCircle size={16} className="text-[#4B6E6D]" />
            <span className="text-sm font-semibold text-[#2C3E40]">Ask Rise</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-[#4B6E6D] text-white rounded-br-md" : "bg-[#EAF0E8] text-[#2C3E40] rounded-bl-md"}`}>
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
            <button onClick={sendMessage} disabled={loading} className="w-10 h-10 rounded-full bg-[#4B6E6D] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <GateModal />
    </>
  );
}