"use client";
import { Alert, Card, CopyButton, DataTable, DetailList, ErrorText, PageHeader, StatusBadge, Timeline } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { dateTime, humanize, money } from "@/lib/format";
import { paymentsApi } from "../api";
import type { Refund } from "../types";
import { RefundForm } from "./RefundForm";

export function PaymentDetailScreen({ id }: { id: string }) {
  const payment = useResource(() => paymentsApi.get(id), [id]);
  const events = useResource(() => paymentsApi.events(id), [id]);
  const refunds = useResource(() => paymentsApi.refunds(id), [id]);
  const p = payment.data;
  const back = { href: "/payments", label: "Payments" };

  if (!p) return <><PageHeader title="Payment" back={back} />{payment.loading ? <p className="muted">Loading…</p> : <ErrorText error={payment.error} />}</>;

  const refundable = p.status === "succeeded" || p.status === "partially_refunded" ? p.amount - p.refunded_amount : 0;
  const reload = () => { payment.reload(); events.reload(); refunds.reload(); };

  return (
    <>
      <PageHeader title={money(p.amount, p.currency)} badge={<StatusBadge status={p.status} />} back={back}
        description={<>{p.reference}{p.description ? ` · ${p.description}` : ""}</>} />
      {p.failure_reason && <Alert tone="danger" title="Why it failed" >{humanize(p.failure_reason)}</Alert>}
      <div className="split" style={{ marginTop: p.failure_reason ? 16 : 0 }}>
        <div className="stack">
          <Card title="Details">
            <DetailList items={[
              ["Payment ID", <span className="cluster"><span className="mono break">{p.id}</span><CopyButton value={p.id} /></span>],
              ["Reference", p.reference],
              ["Method", p.payment_method ? humanize(p.payment_method) : "Not chosen yet"],
              ["Provider", p.provider || "—"],
              ["Fee", money(p.fee, p.currency)],
              !!p.reserve && ["Reserve", `${money(p.reserve, p.currency)} for ${p.reserve_days} days`],
              ["Refunded", money(p.refunded_amount, p.currency)],
              (p.customer_name || p.customer_email || p.customer_phone) && ["Customer", [p.customer_name, p.customer_email, p.customer_phone].filter(Boolean).join(" · ")],
              ["Environment", p.environment],
              ["Created", dateTime(p.created_at)],
            ]} />
          </Card>
          {refundable > 0 && <RefundForm payment={p} refundable={refundable} onDone={reload} />}
          {(refunds.data?.data.length ?? 0) > 0 && (
            <Card title="Refunds" flush>
              <DataTable<Refund> label="Refunds" rows={refunds.data?.data} rowKey={(r) => r.id} columns={[
                { key: "amount", header: "Amount", cell: (r) => <span className="num">{money(r.amount, r.currency)}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                { key: "date", header: "Date", cell: (r) => <span className="muted small">{dateTime(r.created_at)}</span> },
              ]} />
            </Card>
          )}
        </div>
        <Card title="History" description="Every status change, in order. It cannot be edited.">
          {events.data?.data.length ? (
            <Timeline items={events.data.data.map((e) => ({
              id: e.id,
              title: <>{e.from_status ? `${humanize(e.from_status)} → ` : ""}{humanize(e.to_status)}</>,
              meta: `${humanize(e.source)} · ${dateTime(e.created_at)}`,
              body: e.reason,
            }))} />
          ) : <p className="muted small">{events.loading ? "Loading…" : "No history yet."}</p>}
        </Card>
      </div>
    </>
  );
}
