import { Icon } from "@/components/ui";
import s from "./Analytics.module.css";

/** "+8.2%" in green or "−5.1%" in red, with an arrow (never colour alone). */
export function Delta({ value, points }: { value: number | null; points?: boolean }) {
  if (value === null || !Number.isFinite(value)) return <span className={s.deltaNone}>—</span>;
  const up = value >= 0;
  const text = points ? `${up ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} pts` : `${up ? "+" : "−"}${Math.abs(value * 100).toFixed(1)}%`;
  return (
    <span className={s.delta} data-dir={up ? "up" : "down"}>
      <Icon name={up ? "arrowUp" : "arrowDown"} size={12} />{text}
    </span>
  );
}
