"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    // TEMPORARY: fake login until backend /login route is ready
    localStorage.setItem("rise_identifier", identifier);
    localStorage.setItem("rise_username", identifier);
    localStorage.removeItem("rise_guest");
    router.push("/mode");
  };

  const handleGuest = () => {
    localStorage.setItem("rise_guest", "true");
    localStorage.removeItem("rise_username");
    localStorage.removeItem("rise_identifier");
    router.push("/mode");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo block */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-violet-200 flex-shrink-0">
            <img
              src="/rise-logo.png"
              alt="Rise logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-2xl font-serif text-violet-900 leading-tight block">Rise</span>
            <p className="text-xs tracking-widest text-violet-400 uppercase">
              confront ~ grow ~ become
            </p>
          </div>
        </div>

        <div className="w-full bg-[#F7F3EC] border border-stone-200 p-8 rounded-3xl shadow-sm">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
              Welcome back
            </span>
          </div>

          <h1 className="text-4xl font-serif text-stone-900 mb-3 leading-tight">
            Continue your rise.
          </h1>
          <p className="text-stone-500 mb-8">
            Sign in to pick up where you left off.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Email or Username
          </label>
          <div className="relative mb-5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-violet-300 text-stone-800"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
          <div className="relative mb-7">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="password"
              className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-violet-300 text-stone-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="bg-[#1F3B33] hover:bg-[#183029] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-semibold text-violet-600">
              Sign up
            </a>
          </p>

          <button
            onClick={handleGuest}
            className="w-full text-center text-sm font-medium underline text-violet-400 mt-3"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}