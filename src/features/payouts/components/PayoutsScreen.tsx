"use client";
import { useState } from "react";
import { Card, DataTable, EmptyState, ErrorText, PageHeader, StatusBadge, type Column } from "@/components/ui";
import { BalanceCards, balancesApi } from "@/features/balances";
import { useResource } from "@/hooks/useResource";
import { dateTime, money, type Currency } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { payoutsApi, type Payout } from "../api";
import { PayoutForm } from "./PayoutForm";

const columns: Column<Payout>[] = [
  { key: "amount", header: "Amount", cell: (p) => <span className="strong num">{money(p.amount, p.currency)}</span> },
  { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  { key: "bank", header: "To", cell: (p) => <div><div>{p.account_name}</div><div className="small subtle">{p.bank_name} · <span className="mono">{p.account_number}</span></div></div> },
  { key: "ref", header: "Bank reference", cell: (p) => p.bank_reference ? <span className="mono small">{p.bank_reference}</span> : p.failure_reason ? <span className="small" style={{ color: "var(--color-danger)" }}>{p.failure_reason}</span> : <span className="subtle">—</span> },
  { key: "date", header: "Requested", cell: (p) => <span className="small muted">{dateTime(p.created_at)}</span> },
];

export function PayoutsScreen() {
  const { env } = useEnv();
  const [currency, setCurrency] = useState<Currency>("ETB");
  const balance = useResource(() => balancesApi.get(currency, env), [currency, env]);
  const payouts = useResource(() => payoutsApi.list(env), [env]);

  return (
    <>
      <PageHeader title="Payouts" description="Move your available balance to your business bank account." />
      <div className="stack">
        <BalanceCards balance={balance.data} currency={currency} loading={balance.loading && !balance.data} />
        <PayoutForm currency={currency} onCurrency={setCurrency} available={balance.data?.available} onDone={() => { balance.reload(); payouts.reload(); }} />
        <Card title="Payout history" flush>
          <ErrorText error={payouts.error} />
          <DataTable label="Payouts" columns={columns} rows={payouts.data?.data} rowKey={(p) => p.id} loading={payouts.loading}
            empty={<EmptyState icon="bank" title="No payouts yet" description="Payouts you request appear here with their bank reference." />} />
        </Card>
      </div>
    </>
  );
}
