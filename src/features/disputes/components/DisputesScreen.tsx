"use client";
import { Card, DataTable, EmptyState, ErrorText, PageHeader, StatusBadge, type Column } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { dateOnly, humanize, money } from "@/lib/format";
import { daysLeft, disputesApi, type Dispute } from "../api";

const columns: Column<Dispute>[] = [
  { key: "amount", header: "Amount", cell: (d) => <span className="strong num">{money(d.amount, d.currency)}</span> },
  { key: "status", header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
  { key: "reason", header: "Reason", cell: (d) => <span style={{ textTransform: "capitalize" }}>{humanize(d.reason_code)}</span> },
  { key: "due", header: "Respond by", cell: (d) => {
    if (d.status !== "needs_response") return <span className="small muted">{dateOnly(d.evidence_due_by)}</span>;
    const n = daysLeft(d.evidence_due_by);
    return <span className="small" style={{ color: n <= 3 ? "var(--color-danger)" : undefined, fontWeight: n <= 3 ? 600 : undefined }}>{dateOnly(d.evidence_due_by)} · {n > 0 ? `${n} day${n === 1 ? "" : "s"} left` : "due today"}</span>;
  } },
];

export function DisputesScreen() {
  const disputes = useResource(() => disputesApi.list(), []);
  return (
    <>
      <PageHeader title="Disputes" description="A customer's bank questioned these payments. Send evidence before the deadline, or the amount goes back to the customer." />
      <Card flush>
        <ErrorText error={disputes.error} />
        <DataTable label="Disputes" columns={columns} rows={disputes.data?.data} rowKey={(d) => d.id} rowHref={(d) => `/disputes/${d.id}`} loading={disputes.loading}
          empty={<EmptyState icon="success" title="No disputes" description="Good news: no customer has disputed a payment." />} />
      </Card>
    </>
  );
}
