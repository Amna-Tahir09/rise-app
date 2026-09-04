"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PLACEHOLDER_RESPONSES = [
  "That's something worth sitting with. Can you tell me a bit more about when this tends to happen?",
  "I hear you. Small, consistent steps usually matter more than big ones — what's one small thing you could try tomorrow?",
  "That makes sense. What do you think is really underneath that feeling?",
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Salaam! I'm here to help you think through your habits or reflections. What's on your mind today?",
  },
];

function loadMessages(): Message[] {
  const saved = localStorage.getItem("rise_chat_history");
  return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
}

function saveMessages(messages: Message[]) {
  localStorage.setItem("rise_chat_history", JSON.stringify(messages));
  window.dispatchEvent(new Event("rise-chat-updated"));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());

    const handleUpdate = () => setMessages(loadMessages());
    window.addEventListener("rise-chat-updated", handleUpdate);
    return () => window.removeEventListener("rise-chat-updated", handleUpdate);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: input.trim(),
    };
    const updated = [...messages, userMessage];
    setMessages(updated);
    saveMessages(updated);
    setInput("");
    setIsTyping(true);

    // TEMPORARY: fake response until backend /chat route exists
    setTimeout(() => {
      const response =
        PLACEHOLDER_RESPONSES[Math.floor(Math.random() * PLACEHOLDER_RESPONSES.length)];
      const withReply = [
        ...updated,
        { id: crypto.randomUUID(), role: "assistant" as const, text: response },
      ];
      setMessages(withReply);
      saveMessages(withReply);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-1 sm:px-0 flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-4rem)]">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#3C6E7A] transition-colors mb-3"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div className="mb-3 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 flex items-center gap-2">
          Ask Rise <MessageCircle size={20} className="text-[#3C6E7A]" />
        </h1>
        <p className="text-sm text-stone-500 mt-1">Talk through what's on your mind.</p>
      </div>

      <div className="flex-1 bg-white border border-stone-200 rounded-3xl p-4 sm:p-6 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#3C6E7A] text-white rounded-br-sm"
                    : "bg-stone-100 text-stone-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-stone-100 text-stone-400 px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-stone-100 border border-stone-200 px-4 py-3 rounded-full outline-none focus:border-[#3C6E7A] text-stone-800 text-sm min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#3C6E7A] hover:bg-[#2C5560] disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}