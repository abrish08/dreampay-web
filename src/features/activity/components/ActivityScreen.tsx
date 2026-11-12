"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, EmptyState, Icon, Input, PageHeader, Select, StatusBadge } from "@/components/ui";
import { ApiError, errorMessage } from "@/lib/api/client";
import { downloadCSV } from "@/lib/csv";
import { useSession } from "@/providers/SessionProvider";
import { dateTime } from "@/lib/format";
import { activityApi, AREAS, describeAction, describeActor, OUTCOMES, type AuditEntry } from "../api";
import s from "./ActivityScreen.module.css";

export function ActivityScreen() {
  const { me } = useSession();
  const [filters, setFilters] = useState({ action: "", outcome: "" });
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [cursor, setCursor] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async (after?: number) => {
    setLoading(true); setError("");
    const q = new URLSearchParams({ limit: "50" });
    if (filters.action) q.set("action", filters.action);
    if (filters.outcome) q.set("outcome", filters.outcome);
    if (after) q.set("starting_after", String(after));
    try {
      const page = await activityApi.list(q);
      setRows((prev) => (after ? [...prev, ...page.data] : page.data));
      setCursor(page.has_more ? page.next_cursor : undefined);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) setForbidden(true);
      else setError(errorMessage(e));
    } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { void load(); }, [load]);

  const term = search.trim().toLowerCase();
  const shown = term ? rows.filter((r) => [r.action, r.actor_label, r.actor_id, r.resource_id, r.ip, r.details?.email, r.error_code]
    .some((v) => v?.toLowerCase().includes(term))) : rows;

  const exportCSV = () => downloadCSV(`activity-${rows.length}.csv`,
    ["time", "who", "actor_kind", "actor_id", "action", "resource_type", "resource_id", "result", "status", "error_code", "ip"],
    shown.map((r) => [r.occurred_at, describeActor(r, me), r.actor_kind, r.actor_id ?? "", r.action, r.resource_type ?? "", r.resource_id ?? "",
      r.outcome, r.status ?? "", r.error_code ?? "", r.ip ?? ""]));

  if (forbidden) {
    return (<><PageHeader title="Activity log" />
      <Alert tone="info" title="You don't have access to the activity log">Ask your business owner to give your role the “View the business's activity log” permission.</Alert></>);
  }

  return (
    <>
      <PageHeader title="Activity log" description="Everything done on your account: by your team, your API keys and sign-ins. It cannot be edited or deleted."
        actions={<Button icon="download" onClick={exportCSV} disabled={!shown.length}>Export CSV</Button>} />
      <Card flush>
        <div className={s.filters}>
          <Select label="Area" options={AREAS} value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
          <Select label="Result" options={OUTCOMES} value={filters.outcome} onChange={(e) => setFilters({ ...filters, outcome: e.target.value })} />
          <Input label="Search loaded entries" type="search" placeholder="Email, ID, IP…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div><Button variant="ghost" icon="refresh" onClick={() => load()} loading={loading}>Refresh</Button></div>
        </div>
        {error && <div className={s.pad}><Alert tone="danger">{error}</Alert></div>}
        {!loading && shown.length === 0 ? (
          <EmptyState icon="activity" title="No activity found" description={term || filters.action || filters.outcome ? "Try other filters." : "Actions on your account appear here."} />
        ) : (
          <div className={s.wrap}>
            <table className={s.table}>
              <thead><tr><th>When</th><th>Who</th><th>What</th><th>Record</th><th>Result</th><th>IP address</th><th aria-label="Details" /></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <Fragment key={r.id}>
                    <tr className={s.row} onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                      <td className="muted small">{dateTime(r.occurred_at)}</td>
                      <td><div className={s.who}><span className={s.kind}>{r.actor_kind.replace("_", " ")}</span>{describeActor(r, me)}</div></td>
                      <td className="strong">{describeAction(r.action)}</td>
                      <td className="mono small">{r.resource_id ? `${r.resource_type ? r.resource_type.replaceAll("_", " ") + " " : ""}${r.resource_id.slice(0, 12)}${r.resource_id.length > 12 ? "…" : ""}` : "—"}</td>
                      <td><StatusBadge status={r.outcome} />{r.error_code && <div className="small subtle">{r.error_code.replaceAll("_", " ")}</div>}</td>
                      <td className="mono small">{r.ip || "—"}</td>
                      <td><Icon name={open === r.id ? "chevronDown" : "chevronRight"} size={15} /></td>
                    </tr>
                    {open === r.id && (
                      <tr className={s.detailRow}><td colSpan={7}>
                        <dl className={s.details}>
                          <dt>Request</dt><dd className="mono">{r.method} {r.route} → {r.status}</dd>
                          {r.resource_id && <><dt>Record ID</dt><dd className="mono">{r.resource_id}</dd></>}
                          {r.actor_id && <><dt>Actor ID</dt><dd className="mono">{r.actor_id}</dd></>}
                          {r.environment && <><dt>Mode</dt><dd>{r.environment}</dd></>}
                          {r.details && Object.entries(r.details).map(([k, v]) => <Fragment key={k}><dt>{k.replaceAll("_", " ")}</dt><dd>{v}</dd></Fragment>)}
                          <dt>Device</dt><dd className="small">{r.user_agent || "—"}</dd>
                          <dt>Reference</dt><dd className="mono small">{r.correlation_id || "—"} · entry #{r.id}</dd>
                        </dl>
                      </td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {cursor && <div className={s.more}><Button onClick={() => load(cursor)} loading={loading}>Load older activity</Button></div>}
      </Card>
    </>
  );
}
