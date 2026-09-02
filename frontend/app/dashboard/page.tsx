"use client";

import { useState, useEffect } from "react";
import HabitDashboard from "./_components/HabitDashboard";
import TazkiyaDashboard from "./_components/TazkiyaDashboard";

export default function DashboardPage() {
  const [mode, setMode] = useState("habit");
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadMode = () => {
      const savedMode = localStorage.getItem("rise_mode");
      if (savedMode) setMode(savedMode);
    };

    loadMode();
    window.addEventListener("rise-mode-changed", loadMode);

    setUsername(localStorage.getItem("rise_username"));

    return () => window.removeEventListener("rise-mode-changed", loadMode);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const greetingName = username ? `, ${username}` : "";

  if (mode === "habit") {
    return <HabitDashboard greetingName={greetingName} today={today} />;
  }
  return <TazkiyaDashboard greetingName={greetingName} today={today} />;
}