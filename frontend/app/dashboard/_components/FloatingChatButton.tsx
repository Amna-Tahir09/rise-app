"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

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

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
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
    if (open) scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open]);

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
    <>
      {/* Floating button — toggles open/close */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#3C6E7A] hover:bg-[#2C5560] text-white shadow-lg flex items-center justify-center transition-all z-50"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}

      {/* Side drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white border-l border-stone-200 shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#3C6E7A]" />
            <span className="font-serif text-lg text-stone-900">Ask Rise</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
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

        <div className="flex items-center gap-2 px-4 py-4 border-t border-stone-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-stone-100 border border-stone-200 px-4 py-2.5 rounded-full outline-none focus:border-[#3C6E7A] text-stone-800 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#3C6E7A] hover:bg-[#2C5560] disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}