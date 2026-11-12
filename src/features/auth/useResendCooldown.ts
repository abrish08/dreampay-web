"use client";
import { useCallback, useEffect, useState } from "react";

// Waiting time before another code can be requested: 60 s, then 2 min, then 5 min.
const STEPS = [60, 120, 300];
const key = (email: string) => `pg_resend:${email.trim().toLowerCase()}`;
type Saved = { until: number; count: number };

function read(email: string): Saved {
  try {
    const v = JSON.parse(sessionStorage.getItem(key(email)) ?? "null") as Saved | null;
    if (v && typeof v.until === "number" && typeof v.count === "number") return v;
  } catch {}
  return { until: 0, count: 0 };
}

/** Call when a code was just sent (sign-up or resend). */
export function startResendCooldown(email: string) {
  try {
    const prev = read(email);
    const count = prev.count + 1;
    const wait = STEPS[Math.min(count - 1, STEPS.length - 1)];
    sessionStorage.setItem(key(email), JSON.stringify({ until: Date.now() + wait * 1000, count }));
  } catch {}
}

/** Seconds left before "Send a new code" is allowed (survives a page reload). */
export function useResendCooldown(email: string) {
  const [left, setLeft] = useState(0);
  const tick = useCallback(() => setLeft(Math.max(0, Math.ceil((read(email).until - Date.now()) / 1000))), [email]);
  useEffect(() => {
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tick]);
  const start = useCallback(() => { startResendCooldown(email); tick(); }, [email, tick]);
  return { left, start };
}

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
