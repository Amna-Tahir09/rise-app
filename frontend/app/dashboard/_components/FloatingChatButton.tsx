"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function FloatingChatButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard/chat")}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#1F3B33] hover:bg-[#183029] text-white shadow-lg flex items-center justify-center transition-colors z-50"
      aria-label="Ask Rise"
    >
      <MessageCircle size={24} />
    </button>
  );
}