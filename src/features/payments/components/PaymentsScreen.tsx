"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ErrorText, Input, PageHeader, Select } from "@/components/ui";
import { errorMessage } from "@/lib/api/client";
import { humanize } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { paymentsApi } from "../api";
import { PAYMENT_STATUSES, type Payment } from "../types";
import { TransactionsTable } from "./TransactionsTable";

export function PaymentsScreen() {
  const { env } = useEnv();
  const params = useSearchParams();
  const [draft, setDraft] = useState({ status: "", reference: params.get("reference") ?? "" });
  const [filters, setFilters] = useState(draft);
  const [rows, setRows] = useState<Payment[]>([]);
  const [cursor, setCursor] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // The command palette can open this page with ?reference=…
  useEffect(() => {
    const ref = params.get("reference") ?? "";
    setDraft((d) => ({ ...d, reference: ref }));
    setFilters((f) => ({ ...f, reference: ref }));
  }, [params]);

  const load = useCallback(async (after?: string) => {
    setLoading(true); setError("");
    const q = new URLSearchParams({ environment: env, limit: "50" });
    if (filters.status) q.set("status", filters.status);
    if (filters.reference) q.set("reference", filters.reference.trim());
    if (after) q.set("starting_after", after);
    try {
      const page = await paymentsApi.list(q);
      setRows((prev) => (after ? [...prev, ...page.data] : page.data));
      setCursor(page.has_more ? page.next_cursor : undefined);
    } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }, [env, filters]);

  useEffect(() => { void load(); }, [load]);
  const filtered = !!(filters.status || filters.reference);

  return (
    <>
      <PageHeader title="Payments" description="Every payment your customers made. Search, sort, select and export." />
      <div className="stack">
        <Card>
          <form className="form-grid" style={{ alignItems: "end" }} onSubmit={(e) => { e.preventDefault(); setFilters(draft); }}>
            <Select label="Status" value={draft.status} placeholder="All statuses" options={PAYMENT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))}
              onChange={(e) => { const next = { ...draft, status: e.target.value }; setDraft(next); setFilters(next); }} />
            <Input label="Exact reference" placeholder="ORDER-1001" value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
            <div className="cluster">
              <Button type="submit" icon="search">Find</Button>
              {filtered && <Button variant="ghost" onClick={() => { const c = { status: "", reference: "" }; setDraft(c); setFilters(c); }}>Clear filters</Button>}
            </div>
          </form>
        </Card>
        <ErrorText error={error} />
        <TransactionsTable rows={rows} loading={loading} title="Transactions" subtitle={`${rows.length}${cursor ? "+" : ""} payments loaded`}
          emptyText={filtered ? "No payments match these filters." : "No payments yet. Create one with your API key, or share a payment link."}
          footer={cursor ? <Button onClick={() => load(cursor)} loading={loading}>Load more</Button> : undefined} />
      </div>
    </>
  );
}
