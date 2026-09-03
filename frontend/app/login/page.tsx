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
  const username = localStorage.getItem("rise_username");
  const isGuest = localStorage.getItem("rise_guest");
  if (username || isGuest) {
    router.replace("/mode");
  }
}, [router]);

  const handleLogin = () => {
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    localStorage.setItem("rise_identifier", identifier);
    localStorage.setItem("rise_username", identifier);
    localStorage.removeItem("rise_guest");
    router.replace("/mode");
  };

  const handleGuest = () => {
    localStorage.setItem("rise_guest", "true");
    localStorage.removeItem("rise_username");
    localStorage.removeItem("rise_identifier");
    router.replace("/mode");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#3C6E7A]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block bg-gradient-to-r from-[#1C1917] to-[#3C6E7A] bg-clip-text text-transparent">
              Rise
            </span>
            <p className="text-xs tracking-widest text-stone-400 uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full bg-white border border-stone-200 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E7A]" />
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Welcome back</span>
          </div>

          <h1 className="text-4xl font-serif text-stone-900 mb-3 leading-tight">Continue your rise.</h1>
          <p className="text-stone-500 mb-8">Sign in to pick up where you left off.</p>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <label className="block text-sm font-semibold text-stone-700 mb-2">Email or Username</label>
          <div className="relative mb-5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
          <div className="relative mb-7">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="password" className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button onClick={handleLogin} className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors">
            Sign in
          </button>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don&apos;t have an account? <a href="/signup" className="font-semibold text-[#3C6E7A]">Sign up</a>
          </p>
          <button onClick={handleGuest} className="w-full text-center text-sm font-medium underline text-[#3C6E7A]/70 mt-3">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}