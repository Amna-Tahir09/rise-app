"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Only auto-redirect if we have a COMPLETE, consistent session —
    // username alone isn't enough. A leftover username with no token/user_id
    // (from a partial clear, guest transition, etc.) should NOT bounce the
    // user past the login form, or they end up stuck unable to actually
    // authenticate.
    const username = localStorage.getItem("rise_username");
    const token = localStorage.getItem("rise_access_token");
    const userId = localStorage.getItem("rise_user_id");
    if (username && token && userId) {
      router.replace("/mode");
    }
  }, [router]);

  const clearStaleLocalData = () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("rise_"))
      .forEach((key) => localStorage.removeItem(key));
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");

    clearStaleLocalData();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ")
          : (data.detail || "Login failed. Please check your credentials.");
        setError(errMsg);
        return;
      }
      const data = await res.json();
      localStorage.setItem("rise_identifier", identifier);
      localStorage.setItem("rise_username", data.name ?? identifier);
      localStorage.setItem("rise_user_id", data.user_id ?? "");
      localStorage.setItem("rise_access_token", data.access_token ?? "");
      localStorage.removeItem("rise_guest");
      router.replace("/mode");
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    }
  };

  const handleGuest = () => {
    clearStaleLocalData();
    localStorage.setItem("rise_guest", "true");
    router.replace("/mode");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#F2F6F0]">
      {/* Background photo layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/rise-landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.8,
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#4B6E6D]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block text-[#2C3E40]">Rise</span>
            <p className="text-xs tracking-widest text-[#4B6E6D] uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#DCE4DC] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4B6E6D]" />
            <span className="text-xs font-semibold tracking-widest text-[#8DA0A0] uppercase">Welcome back</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-[#2C3E40] mb-3 leading-tight">Continue your rise.</h1>
          <p className="text-[#5E7473] mb-8">Sign in to pick up where you left off.</p>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <label className="block text-sm font-semibold text-[#2C3E40] mb-2">Email</label>
          <div className="relative mb-5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8DA0A0]" size={18} />
            <input className="bg-[#EAF0E8] border border-[#DCE4DC] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#4B6E6D] text-[#2C3E40]" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-[#2C3E40] mb-2">Password</label>
          <div className="relative mb-7">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8DA0A0]" size={18} />
            <input type="password" className="bg-[#EAF0E8] border border-[#DCE4DC] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#4B6E6D] text-[#2C3E40]" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button onClick={handleLogin} className="bg-[#4B6E6D] hover:bg-[#3A5654] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors">
            Sign in
          </button>

          <p className="text-center text-sm text-[#5E7473] mt-6">
            Don&apos;t have an account? <a href="/signup" className="font-semibold text-[#4B6E6D]">Sign up</a>
          </p>
          <button onClick={handleGuest} className="w-full text-center text-sm font-medium underline text-[#4B6E6D]/70 mt-3">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}