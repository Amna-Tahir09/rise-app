"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("rise_username");
    const isGuest = localStorage.getItem("rise_guest");

    if (username || isGuest) {
      router.replace("/mode");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}