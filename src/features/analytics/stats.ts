// Dashboard numbers, worked out in the browser from the payments list.
import type { Payment } from "@/features/payments";

export type Period = 7 | 30 | 90;
export type Metric = "revenue" | "payments" | "rate" | "average";

export const PAID = new Set(["succeeded", "partially_refunded", "refunded"]); // money was captured
const FINISHED = new Set([...PAID, "failed", "expired"]);

export type Totals = { revenue: number; payments: number; finished: number; rate: number | null; average: number | null; refunded: number };
export type DayPoint = { day: Date; revenue: number; payments: number; finished: number };
export type MethodShare = { method: string; amount: number; count: number; share: number };

export function totals(list: Payment[]): Totals {
  let revenue = 0, payments = 0, finished = 0, refunded = 0;
  for (const p of list) {
    if (FINISHED.has(p.status)) finished++;
    if (PAID.has(p.status)) { revenue += p.amount; payments++; refunded += p.refunded_amount; }
  }
  return { revenue, payments, finished, refunded, rate: finished ? payments / finished : null, average: payments ? Math.round(revenue / payments) : null };
}

/** Local midnight. */
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** The current window ends at the end of today; the previous one is just before it. */
export function windows(period: Period, now = new Date()) {
  const end = addDays(startOfDay(now), 1);
  const start = addDays(end, -period);
  return { end, start, prevStart: addDays(start, -period) };
}

export function daily(list: Payment[], start: Date, days: number): DayPoint[] {
  const points: DayPoint[] = Array.from({ length: days }, (_, i) => ({ day: addDays(start, i), revenue: 0, payments: 0, finished: 0 }));
  for (const p of list) {
    const i = Math.round((startOfDay(new Date(p.created_at)).getTime() - start.getTime()) / 864e5);
    const pt = points[i];
    if (!pt) continue;
    if (FINISHED.has(p.status)) pt.finished++;
    if (PAID.has(p.status)) { pt.revenue += p.amount; pt.payments++; }
  }
  return points;
}

export function byMethod(list: Payment[]): MethodShare[] {
  const m = new Map<string, MethodShare>();
  let total = 0;
  for (const p of list) {
    if (!PAID.has(p.status)) continue;
    const k = p.payment_method || "";
    const e = m.get(k) ?? { method: k, amount: 0, count: 0, share: 0 };
    e.amount += p.amount; e.count++; total += p.amount;
    m.set(k, e);
  }
  return [...m.values()].map((e) => ({ ...e, share: total ? e.amount / total : 0 })).sort((a, b) => b.amount - a.amount);
}

export function pointValue(pt: DayPoint, metric: Metric): number | null {
  switch (metric) {
    case "revenue": return pt.revenue;
    case "payments": return pt.payments;
    case "rate": return pt.finished ? pt.payments / pt.finished : null;
    case "average": return pt.payments ? pt.revenue / pt.payments : null;
  }
}

/** Relative change, or null when there is nothing to compare with. */
export function change(now: number | null, before: number | null): number | null {
  if (now === null || before === null || before === 0) return null;
  return (now - before) / before;
}
