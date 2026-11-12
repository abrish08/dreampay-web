"use client";
import { Button } from "./Button";
import { CopyButton } from "./CopyButton";
import s from "./SecretReveal.module.css";

/** A secret shown exactly once (API key, webhook secret). */
export function SecretReveal({ title, value, onDone }: { title: string; value: string; onDone: () => void }) {
  return (
    <div className={s.box} role="status">
      <div><strong>{title}</strong><div className="small muted">Copy it now and keep it on your server. It will not be shown again.</div></div>
      <div className={s.value}>{value}</div>
      <div className="cluster"><CopyButton value={value} /><Button size="sm" variant="ghost" onClick={onDone}>I have saved it</Button></div>
    </div>
  );
}
