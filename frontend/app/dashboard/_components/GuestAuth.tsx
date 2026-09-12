"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// Drop this into your login/signup page. Renders a
// "Continue as guest" link/button below your existing form.
// ============================================================
export function ContinueAsGuestButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const continueAsGuest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guest-signup`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Guest signup failed with status ${res.status}`);
      const data = await res.json();

      localStorage.setItem("rise_access_token", data.access_token);
      localStorage.setItem("rise_user_id", data.user_id.toString());
      localStorage.setItem("rise_guest", "true");

      router.push("/onboarding"); // adjust to wherever a fresh user should land
    } catch (err) {
      console.error("Guest signup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={continueAsGuest}
      disabled={loading}
      className="text-sm text-[#5A6B7A] underline hover:text-[#1E2A32] transition-colors disabled:opacity-60"
    >
      {loading ? "Setting up..." : "Continue as guest"}
    </button>
  );
}


// ============================================================
// Drop this into your dashboard (or any shared layout) so
// logged-in guests see a persistent prompt to save their account.
// Renders nothing for non-guest users.
// ============================================================
export function ClaimAccountBanner() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isGuest =
    typeof window !== "undefined" && localStorage.getItem("rise_guest") === "true";

  if (!isGuest) return null;

  const handleClaim = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const userId = localStorage.getItem("rise_user_id") || "";
      const token = localStorage.getItem("rise_access_token") || "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claim-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: Number(userId), name, email, password }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.detail || "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("rise_access_token", data.access_token);
      localStorage.setItem("rise_user_id", data.user_id.toString());
      localStorage.removeItem("rise_guest");
      setOpen(false);
    } catch (err) {
      console.error("Claim account failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#E8B84B]/10 border border-[#E8B84B]/30 rounded-2xl p-4 mb-5">
      {!open ? (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-[#1E2A32]">
            You're using Rise as a guest — save your account so you don't lose your data.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="bg-[#2E5E4E] text-white text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0"
          >
            Save my account
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-[#1E2A32] mb-3">Create your account</p>
          {error && <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3">{error}</div>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-white border border-[#E5E0D5] px-3 py-2 rounded-xl text-sm mb-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full bg-white border border-[#E5E0D5] px-3 py-2 rounded-xl text-sm mb-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full bg-white border border-[#E5E0D5] px-3 py-2 rounded-xl text-sm mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleClaim}
              disabled={saving}
              className="flex-1 bg-[#2E5E4E] text-white text-sm font-semibold py-2 rounded-full disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save account"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 text-sm text-[#5A6B7A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}