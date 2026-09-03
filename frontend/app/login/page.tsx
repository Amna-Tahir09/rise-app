"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold mb-1 text-violet-900">Welcome back to Rise</h1>
        <p className="text-violet-400 mb-6">confront ~ grow ~ become</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-violet-700 mb-1">
          Email or Username
        </label>
        <input
          className="border border-violet-200 p-3 w-full rounded-xl mb-4"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <label className="block text-sm font-medium text-violet-700 mb-1">Password</label>
        <input
          type="password"
          className="border border-violet-200 p-3 w-full rounded-xl mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-violet-400 to-amber-300 text-white px-4 py-3 rounded-xl w-full font-medium"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-violet-500 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-medium underline">
            Sign up
          </a>
        </p>

        <button
          onClick={handleGuest}
          className="w-full text-center text-sm text-violet-400 underline mt-3"
        >
          Continue as guest
        </button>

      </div>
    </div>
  );
}