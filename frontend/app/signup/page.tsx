"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    localStorage.setItem("rise_username", name);
    localStorage.removeItem("rise_guest");
    localStorage.setItem("rise_email", email);
    router.push("/mode");
  };

  const handleGuest = () => {
    localStorage.setItem("rise_guest", "true");
    router.push("/mode");
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
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Create your account</span>
          </div>

          <h1 className="text-4xl font-serif text-stone-900 mb-3 leading-tight">Begin your rise.</h1>
          <p className="text-stone-500 mb-8">Set up your account to start practicing.</p>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <label className="block text-sm font-semibold text-stone-700 mb-2">Name</label>
          <div className="relative mb-5">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
          <div className="relative mb-5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
          <div className="relative mb-1">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="password" className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <p className="text-xs text-[#3C6E7A] mb-5">At least 6 characters.</p>

          <label className="block text-sm font-semibold text-stone-700 mb-2">Confirm Password</label>
          <div className="relative mb-7">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="password" className="bg-stone-100 border border-stone-200 pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#3C6E7A] text-stone-800" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button onClick={handleSignup} className="bg-[#3C6E7A] hover:bg-[#2C5560] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors">
            Create account
          </button>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account? <a href="/login" className="font-semibold text-[#3C6E7A]">Sign in</a>
          </p>
          <p className="text-center text-sm mt-3">
            <button onClick={handleGuest} className="font-medium underline text-[#3C6E7A]/70">Continue as guest</button>
          </p>
        </div>
      </div>
    </div>
  );
}