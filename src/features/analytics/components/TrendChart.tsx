"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { change } from "../stats";
import { Delta } from "./Delta";
import s from "./Analytics.module.css";

export type ChartPoint = { day: Date; value: number | null };

const H = 260;
const PAD = { top: 16, right: 16, bottom: 30, left: 52 };

/** A step of 1, 2, 2.5 or 5 times a power of ten, so axis labels read well. */
function niceStep(raw: number, integer: boolean) {
  if (raw <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * p >= raw) ?? 10) * p;
  return integer ? Math.max(1, Math.ceil(step)) : step;
}
const TICKS = 4;

/**
 * One line, one axis. Hover or use the arrow keys: a crosshair snaps to the
 * nearest day and a tooltip shows the value and the change from the day before.
 */
export function TrendChart({ points, format, axisFormat, label, integer = false }: { points: ChartPoint[]; format: (v: number) => string; axisFormat: (v: number) => string; label: string; integer?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(700);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { x, y, max, path, ticks } = useMemo(() => {
    const vals = points.map((p) => p.value ?? 0);
    const step = niceStep((Math.max(...vals, 0) * 1.05) / TICKS, integer);
    const max = step * TICKS;
    const iw = w - PAD.left - PAD.right, ih = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
    const y = (v: number) => PAD.top + ih - (v / max) * ih;
    // Days without a value (e.g. no finished payments for the success rate) break the line.
    let path = "", pen = false;
    points.forEach((p, i) => {
      if (p.value === null) { pen = false; return; }
      path += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`;
      pen = true;
    });
    return { x, y, max, path, ticks: Array.from({ length: TICKS + 1 }, (_, i) => i * step) };
  }, [points, w, integer]);

  const every = Math.ceil(points.length / Math.max(2, Math.floor((w - PAD.left) / 80)));
  const dayLabel = (d: Date) => points.length <= 7 ? d.toLocaleDateString(undefined, { weekday: "short" }) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const pick = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const rel = (clientX - r.left - PAD.left) / (w - PAD.left - PAD.right);
    setActive(Math.max(0, Math.min(points.length - 1, Math.round(rel * (points.length - 1)))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => Math.max(0, Math.min(points.length - 1, (i ?? points.length - 1) + (e.key === "ArrowRight" ? 1 : -1))));
    }
    if (e.key === "Escape") setActive(null);
  };

  const a = active !== null ? points[active] : null;
  const prev = active !== null && active > 0 ? points[active - 1].value : null;
  const tipLeft = active !== null ? Math.min(Math.max(x(active), 90), w - 90) : 0;
  const tipAbove = a?.value != null && y(a.value) > PAD.top + 70;

  return (
    <div ref={box} className={s.chart} onPointerMove={(e) => pick(e.clientX)} onPointerLeave={() => setActive(null)}>
      <svg width={w} height={H} role="img" tabIndex={0} onKeyDown={onKey} onFocus={() => setActive((i) => i ?? points.length - 1)} onBlur={() => setActive(null)}
        aria-label={`${label}: line chart of ${points.length} days, highest ${format(Math.max(...points.map((p) => p.value ?? 0)))}. Use left and right arrows to read each day.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} className={s.grid} />
            <text x={PAD.left - 10} y={y(t)} className={s.axis} textAnchor="end" dominantBaseline="middle">{axisFormat(t)}</text>
          </g>
        ))}
        {points.map((p, i) => (i % every === 0 || i === points.length - 1) && (i === points.length - 1 || points.length - 1 - i >= every / 2) && (
          <text key={i} x={x(i)} y={H - 8} className={s.axis} textAnchor="middle">{dayLabel(p.day)}</text>
        ))}
        {max > 0 && <path d={path} className={s.line} />}
        {active !== null && (
          <>
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} className={s.crosshair} />
            {a?.value != null && <circle cx={x(active)} cy={y(a.value)} r={5} className={s.dot} />}
          </>
        )}
      </svg>
      {a && (
        <div className={s.tooltip} style={{ left: tipLeft, top: tipAbove && a.value != null ? y(a.value) - 12 : PAD.top + 8, transform: tipAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)" }} aria-live="polite">
          <div className={s.tipDate}>{a.day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
          <div className={s.tipRow}><strong>{a.value === null ? "No data" : format(a.value)}</strong>{active! > 0 && <Delta value={change(a.value, prev)} />}</div>
          {active! > 0 && <div className={s.tipVs}>vs the day before</div>}
        </div>
      )}
    </div>
  );
}

/** The same numbers as a table (screen readers, exact values). */
export function TrendTable({ points, format, label }: { points: ChartPoint[]; format: (v: number) => string; label: string }) {
  return (
    <div className={s.tableView}>
      <table>
        <caption className="sr-only">{label} per day</caption>
        <thead><tr><th scope="col">Day</th><th scope="col" style={{ textAlign: "right" }}>{label}</th></tr></thead>
        <tbody>{[...points].reverse().map((p) => (
          <tr key={p.day.toISOString()}><td>{p.day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</td>
            <td style={{ textAlign: "right" }} className="num">{p.value === null ? "—" : format(p.value)}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
