"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useSignupGate } from "../_components/SignupGate";

type Message = { role: "user" | "assistant"; content: string };

const getUserId = () => localStorage.getItem("rise_user_id") || "";
const getToken = () => localStorage.getItem("rise_access_token") || "";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requireAccount, GateModal } = useSignupGate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rise_chat_history") || "[]");
    setMessages(
      saved.length
        ? saved
        : [{ role: "assistant", content: "Salaam! I'm here to help you think through your habits or reflections. What's on your mind today?" }]
    );

    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("rise_chat_history") || "[]");
      setMessages(updated);
    };
    window.addEventListener("rise-chat-updated", handleUpdate);
    return () => window.removeEventListener("rise-chat-updated", handleUpdate);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
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
      console.error("Chat request failed:", err);
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
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/habits-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto p-5 sm:p-8 flex flex-col h-screen">
      <button onClick={() => router.push("/dashboard")} className="text-[#5A6B7A] text-sm mb-3 flex items-center gap-1 hover:text-[#1E2A32] transition-colors">
        <ArrowLeft size={14} /> Back to dashboard
      </button>
      <h1 className="text-2xl sm:text-3xl font-serif text-[#1E2A32] flex items-center gap-2">
        Ask Rise <MessageCircle size={20} className="text-[#2E5E4E]" />
      </h1>
      <p className="text-sm text-[#5A6B7A] mb-5">Talk through what&apos;s on your mind.</p>

      <div className="flex-1 bg-white border border-[#E5E0D5] rounded-3xl p-5 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3.5 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user" ? "bg-[#2E5E4E] text-white rounded-br-md" : "bg-[#F4F1EA] text-[#1E2A32] rounded-bl-md"
                }`}
              >
                {m.content}
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
            className="flex-1 bg-[#F4F1EA] border border-[#E5E0D5] px-4.5 py-3 rounded-full text-sm focus:outline-none focus:border-[#2E5E4E]"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-11 h-11 rounded-full bg-[#2E5E4E] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      </div>
      <GateModal />
    </div>
  );
}