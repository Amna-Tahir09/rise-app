"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    // TEMPORARY: fake save until backend /signup route is ready
    localStorage.setItem("rise_username", name);
    localStorage.removeItem("rise_guest");
    localStorage.setItem("rise_email", email);
    router.push("/mode");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold mb-1 text-violet-900">Create your account</h1>
        <p className="text-violet-400 mb-6">confront ~ grow ~ become</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-violet-700 mb-1">Name</label>
        <input
          className="border border-violet-200 p-3 w-full rounded-xl mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block text-sm font-medium text-violet-700 mb-1">Email</label>
        <input
          className="border border-violet-200 p-3 w-full rounded-xl mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm font-medium text-violet-700 mb-1">Password</label>
        <input
          type="password"
          className="border border-violet-200 p-3 w-full rounded-xl mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block text-sm font-medium text-violet-700 mb-1">Confirm Password</label>
        <input
          type="password"
          className="border border-violet-200 p-3 w-full rounded-xl mb-6"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-gradient-to-r from-violet-400 to-amber-300 text-white px-4 py-3 rounded-xl w-full font-medium"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-violet-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}