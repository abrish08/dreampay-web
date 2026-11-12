"use client";
import { useState } from "react";
import { Button, Segmented } from "@/components/ui";
import { money } from "@/lib/format";
import { change, pointValue, type DayPoint, type Metric, type Totals } from "../stats";
import { Delta } from "./Delta";
import { TrendChart, TrendTable } from "./TrendChart";
import s from "./Analytics.module.css";

const TITLES: Record<Metric, string> = { revenue: "Revenue overview", payments: "Successful payments", rate: "Success rate", average: "Average payment" };

const compact = (v: number) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(v);

export function RevenueCard({ metric, onMetric, series, current, previous, currency, loading }: {
  metric: Metric; onMetric: (m: Metric) => void; series: DayPoint[]; current?: Totals; previous?: Totals; currency: string; loading?: boolean;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const points = series.map((p) => ({ day: p.day, value: pointValue(p, metric) }));
  const format = (v: number) => metric === "rate" ? `${(v * 100).toFixed(1)}%` : metric === "payments" ? Math.round(v).toLocaleString() : money(Math.round(v), currency);
  const axis = (v: number) => metric === "rate" ? `${Math.round(v * 100)}%` : metric === "payments" ? compact(v) : compact(v / 100);
  const headline = metric === "revenue" ? money(current?.revenue, currency) : metric === "payments" ? (current?.payments ?? 0).toLocaleString()
    : metric === "rate" ? (current?.rate == null ? "—" : `${(current.rate * 100).toFixed(1)}%`) : current?.average == null ? "—" : money(current.average, currency);
  const delta = metric === "rate" ? (current?.rate != null && previous?.rate != null ? current.rate - previous.rate : null)
    : change(metric === "revenue" ? current?.revenue ?? null : metric === "payments" ? current?.payments ?? null : current?.average ?? null,
             metric === "revenue" ? previous?.revenue ?? null : metric === "payments" ? previous?.payments ?? null : previous?.average ?? null);

  return (
    <section className={s.card} aria-busy={loading || undefined}>
      <div className={s.cardHead}>
        <div>
          <div className={s.cardTitle}>{TITLES[metric]}</div>
          <div className={s.headline}><span>{headline}</span><Delta value={delta} points={metric === "rate"} /><span className={s.kpiVs}>vs previous period</span></div>
        </div>
        <div className="cluster">
          <Segmented label="Measure" value={metric} onChange={onMetric} options={[
            { value: "revenue", label: "Revenue" }, { value: "payments", label: "Count" }, { value: "rate", label: "Rate" },
          ]} />
          <Button size="sm" variant="ghost" onClick={() => setView(view === "chart" ? "table" : "chart")} aria-pressed={view === "table"}>
            {view === "chart" ? "Table" : "Chart"}
          </Button>
        </div>
      </div>
      {loading && !series.length ? <div className={s.chartSkeleton} /> : view === "chart"
        ? <TrendChart points={points} format={format} axisFormat={axis} label={TITLES[metric]} integer={metric === "payments"} />
        : <TrendTable points={points} format={format} label={TITLES[metric]} />}
    </section>
  );
}
