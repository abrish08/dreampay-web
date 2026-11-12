"use client";
import { useState } from "react";
import { Alert, Button, ErrorText, Menu, MenuItem, Segmented } from "@/components/ui";
import { paymentsApi, TransactionsTable } from "@/features/payments";
import { useResource } from "@/hooks/useResource";
import { CURRENCIES, type Currency } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { isVerified, useSession } from "@/providers/SessionProvider";
import Link from "next/link";
import { MAX_PAYMENTS } from "../api";
import type { Metric, Period } from "../stats";
import { useDashboardStats } from "../useDashboardStats";
import { KpiGrid } from "./KpiGrid";
import { MethodsCard } from "./MethodsCard";
import { RevenueCard } from "./RevenueCard";
import { VerificationCard } from "./VerificationCard";
import s from "./Analytics.module.css";

const PERIODS: { value: Period; label: string }[] = [{ value: 7, label: "Last 7 days" }, { value: 30, label: "Last 30 days" }, { value: 90, label: "Last 90 days" }];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function DashboardScreen() {
  const { env } = useEnv();
  const { me, merchant } = useSession();
  const [currency, setCurrency] = useState<Currency>("ETB");
  const [period, setPeriod] = useState<Period>(7);
  const [metric, setMetric] = useState<Metric>("revenue");
  const { stats, loading, error, complete, reload } = useDashboardStats(env, currency, period);
  const recent = useResource(() => paymentsApi.list(new URLSearchParams({ environment: env, limit: "8" })), [env]);
  const first = me?.name?.split(/\s+/)[0];

  return (
    <>
      <div className={s.greet}>
        <div>
          <h1>{greeting()}{first ? `, ${first}` : ""}</h1>
          <p>Welcome back to {merchant?.name ?? "Paygate"} 👋</p>
        </div>
        <div className="cluster">
          <Segmented label="Currency" value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
          <Menu width={180} trigger={(p) => <Button {...p} icon="chevronDown">{PERIODS.find((x) => x.value === period)!.label}</Button>}>
            {PERIODS.map((x) => <MenuItem key={x.value} checked={x.value === period} onSelect={() => setPeriod(x.value)}>{x.label}</MenuItem>)}
          </Menu>
          <Button variant="ghost" iconOnly icon="refresh" aria-label="Refresh" onClick={() => { reload(); recent.reload(); }} loading={loading} />
        </div>
      </div>

      <div className="stack">
        {merchant && !isVerified(merchant.kyc_status) && env === "live" && (
          <Alert tone="warning" title="Live payments start after verification" action={<Link href="/kyc">Continue →</Link>}>
            You can use test mode now. Live payments open once we approve your business.
          </Alert>
        )}
        <ErrorText error={error} />
        <div className={s.layout}>
          <div className={s.left}>
            <KpiGrid current={stats?.current} previous={stats?.previous} currency={currency} period={period} metric={metric} onMetric={setMetric} loading={loading} />
            <RevenueCard metric={metric} onMetric={setMetric} series={stats?.series ?? []} current={stats?.current} previous={stats?.previous} currency={currency} loading={loading} />
          </div>
          <div className={s.right}>
            <VerificationCard />
            <MethodsCard methods={stats?.methods ?? []} currency={currency} loading={loading} />
          </div>
        </div>
        {!complete && <p className={s.partial}>Numbers are based on the latest {MAX_PAYMENTS.toLocaleString()} payments of the period. Download a report for the full figures.</p>}
        <TransactionsTable rows={recent.data?.data ?? []} loading={recent.loading} seeAll subtitle="The latest payments from your customers." />
      </div>
    </>
  );
}
