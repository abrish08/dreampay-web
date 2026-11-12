"use client";
import Link from "next/link";
import { Alert, Card, DetailList, ErrorText, Icon, PageHeader, StatusBadge, Timeline } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { dateTime, fileSize, humanize, money } from "@/lib/format";
import { daysLeft, disputesApi } from "../api";
import { EvidenceForm } from "./EvidenceForm";

export function DisputeDetailScreen({ id }: { id: string }) {
  const dispute = useResource(() => disputesApi.get(id), [id]);
  const d = dispute.data;
  const back = { href: "/disputes", label: "Disputes" };
  if (!d) return <><PageHeader title="Dispute" back={back} />{dispute.loading ? <p className="muted">Loading…</p> : <ErrorText error={dispute.error} />}</>;

  const open = d.status === "needs_response";
  const left = daysLeft(d.evidence_due_by);
  return (
    <>
      <PageHeader title={`Dispute · ${money(d.amount, d.currency)}`} badge={<StatusBadge status={d.status} />} back={back} />
      <div className="stack">
        {open && <Alert tone={left <= 3 ? "danger" : "warning"} title={left > 0 ? `${left} day${left === 1 ? "" : "s"} left to respond` : "The deadline is today"}>
          Respond by {dateTime(d.evidence_due_by)}. Without a response the dispute is lost.</Alert>}
        {d.outcome && <Alert tone={d.outcome === "won" ? "success" : "danger"} title={`Dispute ${d.outcome}`}>{d.note}</Alert>}
        <div className="split">
          <div className="stack">
            {open && <EvidenceForm dispute={d} onChange={dispute.reload} />}
            {!open && d.evidence_text && <Card title="Your evidence"><p style={{ whiteSpace: "pre-wrap" }}>{d.evidence_text}</p></Card>}
            {d.files.length > 0 && (
              <Card title="Files">
                <ul className="stack-sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {d.files.map((f) => (
                    <li key={f.id} className="cluster">
                      <Icon name="file" size={16} /><a href={disputesApi.fileUrl(d.id, f.id)}>{f.name}</a><span className="small subtle">{fileSize(f.size)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          <div className="stack">
            <Card title="Details">
              <DetailList items={[
                ["Payment", <Link href={`/payments/${d.payment_id}`} className="mono small break">{d.payment_id}</Link>],
                ["Reason", <span style={{ textTransform: "capitalize" }}>{humanize(d.reason_code)}</span>],
                d.reason && ["Bank's note", d.reason],
                ["Opened", dateTime(d.created_at)],
                d.evidence_submitted_at && ["Submitted", dateTime(d.evidence_submitted_at)],
                d.closed_at && ["Closed", dateTime(d.closed_at)],
              ]} />
            </Card>
            {!!d.history?.length && (
              <Card title="History">
                <Timeline items={d.history.map((h) => ({ id: h.id, title: <span style={{ textTransform: "capitalize" }}>{humanize(h.action)}</span>, meta: dateTime(h.created_at), body: h.note }))} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
