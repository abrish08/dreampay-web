"use client";
import { useEffect, useMemo, useState } from "react";
import type { Payment } from "@/features/payments";
import { errorMessage } from "@/lib/api/client";
import { paymentsBetween } from "./api";
import { byMethod, daily, totals, windows, type Period } from "./stats";

/** Loads this period and the one before it, then computes the dashboard numbers. */
export function useDashboardStats(environment: string, currency: string, period: Period) {
  const [rows, setRows] = useState<Payment[] | null>(null);
  const [complete, setComplete] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const w = useMemo(() => windows(period), [period, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctl = new AbortController();
    setLoading(true); setError("");
    paymentsBetween(environment, w.prevStart, w.end, ctl.signal)
      .then((r) => { setRows(r.rows); setComplete(r.complete); })
      .catch((e) => { if (!ctl.signal.aborted) setError(errorMessage(e)); })
      .finally(() => { if (!ctl.signal.aborted) setLoading(false); });
    return () => ctl.abort();
  }, [environment, w]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const mine = rows.filter((p) => p.currency === currency);
    const cur = mine.filter((p) => Date.parse(p.created_at) >= w.start.getTime());
    const prev = mine.filter((p) => Date.parse(p.created_at) < w.start.getTime());
    return { current: totals(cur), previous: totals(prev), series: daily(cur, w.start, period), methods: byMethod(cur) };
  }, [rows, currency, w, period]);

  return { stats, loading, error, complete, reload: () => setTick((n) => n + 1) };
}
