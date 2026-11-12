"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";
import s from "./Toast.module.css";

type Tone = "success" | "danger" | "info";
type Item = { id: number; text: string; tone: Tone };
const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});
let next = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const toast = useCallback((text: string, tone: Tone = "success") => {
    const id = ++next;
    setItems((xs) => [...xs.slice(-2), { id, text, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className={s.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx(s.toast, s[t.tone])}>
            <Icon name={t.tone === "danger" ? "alert" : t.tone === "info" ? "info" : "success"} size={17} />{t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
