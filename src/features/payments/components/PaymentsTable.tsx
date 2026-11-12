"use client";
import { DataTable, StatusBadge, type Column } from "@/components/ui";
import { dateTime, humanize, money } from "@/lib/format";
import type { Payment } from "../types";

const columns: Column<Payment>[] = [
  { key: "amount", header: "Amount", cell: (p) => <span className="strong num">{money(p.amount, p.currency)}</span> },
  { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  { key: "reference", header: "Reference", cell: (p) => <span className="truncate">{p.reference}</span> },
  { key: "method", header: "Method", cell: (p) => (p.payment_method ? humanize(p.payment_method) : <span className="subtle">—</span>) },
  { key: "created", header: "Date", cell: (p) => <span className="muted small">{dateTime(p.created_at)}</span> },
];

export function PaymentsTable({ rows, loading, empty }: { rows?: Payment[]; loading?: boolean; empty?: React.ReactNode }) {
  return <DataTable label="Payments" columns={columns} rows={rows} rowKey={(p) => p.id} rowHref={(p) => `/payments/${p.id}`} loading={loading} empty={empty} />;
}
