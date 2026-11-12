"use client";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import s from "./Segmented.module.css";

type Option<V extends string> = { value: V; label: string; icon?: IconName; iconOnly?: boolean };

/** A small radio group shown as buttons (environment, theme). */
export function Segmented<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: Option<V>[]; onChange: (v: V) => void }) {
  const move = (dir: 1 | -1) => {
    const i = options.findIndex((o) => o.value === value);
    onChange(options[(i + dir + options.length) % options.length].value);
  };
  return (
    <div className={s.group} role="radiogroup" aria-label={label}
      onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); } if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); } }}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1}
          className={cx(s.option, o.iconOnly && s.iconOnly)} onClick={() => onChange(o.value)} title={o.iconOnly ? o.label : undefined}
          aria-label={o.iconOnly ? o.label : undefined}>
          {o.icon && <Icon name={o.icon} size={15} />}
          {!o.iconOnly && o.label}
        </button>
      ))}
    </div>
  );
}
