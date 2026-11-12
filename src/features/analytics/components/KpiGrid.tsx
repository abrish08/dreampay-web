"use client";
import { money } from "@/lib/format";
import { change, type Metric, type Totals } from "../stats";
import { Delta } from "./Delta";
import s from "./Analytics.module.css";

type Props = { current?: Totals; previous?: Totals; currency: string; period: number; metric: Metric; onMetric: (m: Metric) => void; loading?: boolean };

/** Four headline numbers. Clicking one shows it in the chart. */
export function KpiGrid({ current, previous, currency, period, metric, onMetric, loading }: Props) {
  const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);
  const cells: { key: Metric; label: string; value: string; delta: number | null; points?: boolean }[] = [
    { key: "revenue", label: "Total revenue", value: money(current?.revenue, currency), delta: change(current?.revenue ?? null, previous?.revenue ?? null) },
    { key: "payments", label: "Successful payments", value: (current?.payments ?? 0).toLocaleString(), delta: change(current?.payments ?? null, previous?.payments ?? null) },
    { key: "rate", label: "Success rate", value: pct(current?.rate ?? null), points: true,
      delta: current?.rate != null && previous?.rate != null ? current.rate - previous.rate : null },
    { key: "average", label: "Average payment", value: current?.average != null ? money(current.average, currency) : "—", delta: change(current?.average ?? null, previous?.average ?? null) },
  ];
  return (
    <div className={s.kpis} role="group" aria-label="Key numbers">
      {cells.map((c) => (
        <button key={c.key} type="button" className={s.kpi} aria-pressed={metric === c.key} onClick={() => onMetric(c.key)}
          title={`Show ${c.label.toLowerCase()} in the chart`}>
          <span className={s.kpiLabel}>{c.label}</span>
          {loading && !current ? <span className={s.kpiSkeleton} /> : (
            <span className={s.kpiRow}>
              <span className={s.kpiValue}>{c.value}</span>
              <Delta value={c.delta} points={c.points} />
              <span className={s.kpiVs}>vs previous {period} days</span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
