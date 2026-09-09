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

  const handleSignup = async () => {
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ username: name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Signup failed. Please try again.");
        return;
      }
      const data = await res.json();
      localStorage.setItem("rise_username", name);
      localStorage.setItem("rise_email", email);
      localStorage.setItem("rise_user_id", data.user_id ?? "");
      localStorage.setItem("rise_access_token", data.access_token ?? "");
      localStorage.removeItem("rise_guest");
      router.replace("/mode");
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    }
  };

  const handleGuest = () => {
    localStorage.setItem("rise_guest", "true");
    router.replace("/mode");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#F9F7F4]">
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
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#2E5E4E]/20 flex-shrink-0">
            <img src="/rise-logo.png" alt="Rise logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-serif leading-tight block text-[#1E2A32]">Rise</span>
            <p className="text-xs tracking-widest text-[#2E5E4E] uppercase">confront ~ grow ~ become</p>
          </div>
        </div>

        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#E5E0D5] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E5E4E]" />
            <span className="text-xs font-semibold tracking-widest text-[#8A8478] uppercase">Create your account</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-[#1E2A32] mb-3 leading-tight">Begin your rise.</h1>
          <p className="text-[#5A6B7A] mb-8">Set up your account to start practicing.</p>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <label className="block text-sm font-semibold text-[#1E2A32] mb-2">Name</label>
          <div className="relative mb-5">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8478]" size={18} />
            <input className="bg-[#F4F1EA] border border-[#E5E0D5] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#2E5E4E] text-[#1E2A32]" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-[#1E2A32] mb-2">Email</label>
          <div className="relative mb-5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8478]" size={18} />
            <input className="bg-[#F4F1EA] border border-[#E5E0D5] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#2E5E4E] text-[#1E2A32]" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <label className="block text-sm font-semibold text-[#1E2A32] mb-2">Password</label>
          <div className="relative mb-1">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8478]" size={18} />
            <input type="password" className="bg-[#F4F1EA] border border-[#E5E0D5] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#2E5E4E] text-[#1E2A32]" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <p className="text-xs text-[#2E5E4E] mb-5">At least 6 characters.</p>

          <label className="block text-sm font-semibold text-[#1E2A32] mb-2">Confirm Password</label>
          <div className="relative mb-7">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8478]" size={18} />
            <input type="password" className="bg-[#F4F1EA] border border-[#E5E0D5] pl-11 pr-4 py-3 w-full rounded-full focus:outline-none focus:border-[#2E5E4E] text-[#1E2A32]" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button onClick={handleSignup} className="bg-[#2E5E4E] hover:bg-[#254D40] text-white px-4 py-3 rounded-full w-full font-semibold transition-colors">
            Create account
          </button>

          <p className="text-center text-sm text-[#5A6B7A] mt-6">
            Already have an account? <a href="/login" className="font-semibold text-[#2E5E4E]">Sign in</a>
          </p>
          <p className="text-center text-sm mt-3">
            <button onClick={handleGuest} className="font-medium underline text-[#2E5E4E]/70">Continue as guest</button>
          </p>
        </div>
      </div>
    </div>
  );
}