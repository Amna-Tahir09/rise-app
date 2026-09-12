"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles } from "lucide-react";

// ============================================================
// Drop this hook into any page that has a protected action
// (saving a habit, sending a chat message, saving a reflection).
//
// Usage:
//   const { isGuest, requireAccount, GateModal } = useSignupGate();
//
//   const handleSave = () => {
//     if (requireAccount()) return; // stops here + shows modal for guests
//     // ...actual save logic (fetch call etc.)
//   };
//
//   return (
//     <div>
//       ...your page...
//       <GateModal />
//     </div>
//   );
// ============================================================
export function useSignupGate() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isGuest =
    typeof window !== "undefined" && localStorage.getItem("rise_guest") === "true";

  // Call this at the top of any protected action. Returns true (and opens
  // the modal) if the user is a guest and should be blocked; returns false
  // if they're a real user and the action should proceed normally.
  const requireAccount = (): boolean => {
    if (isGuest) {
      setOpen(true);
      return true;
    }
    return false;
  };

  const goToSignup = () => {
    setOpen(false);
    router.push("/signup");
  };

  const GateModal = () => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-xl">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-[#B0AA9C] hover:text-[#1E2A32] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 rounded-full bg-[#E8B84B]/15 flex items-center justify-center mb-4">
            <Sparkles size={20} className="text-[#C99A2E]" />
          </div>
          <h2 className="text-xl font-serif text-[#1E2A32] mb-2">Create an account to continue</h2>
          <p className="text-sm text-[#5A6B7A] mb-6 leading-relaxed">
            You're browsing Rise as a guest. Sign up to save your progress, track streaks, and get chat answers grounded in your own history.
          </p>
          <button
            onClick={goToSignup}
            className="w-full bg-[#2E5E4E] hover:bg-[#254D40] text-white rounded-full py-3 font-semibold text-sm transition-colors mb-2.5"
          >
            Sign up
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-sm text-[#8A8478] py-2"
          >
            Keep browsing
          </button>
        </div>
      </div>
    );
  };

  return { isGuest, requireAccount, GateModal };
}