"use client";
import { useState } from "react";
import { Button } from "./Button";

export function CopyButton({ value, label = "Copy", size = "sm" }: { value: string; label?: string; size?: "sm" | "md" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {}
  };
  return <Button size={size} icon={done ? "check" : "copy"} onClick={copy} aria-live="polite">{done ? "Copied" : label}</Button>;
}
