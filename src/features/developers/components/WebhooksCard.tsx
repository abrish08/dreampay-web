"use client";
import { useState } from "react";
import { Button, Card, DataTable, EmptyState, ErrorText, Input, SecretReveal, StatusBadge, useConfirm, useToast, type Column } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useResource } from "@/hooks/useResource";
import { dateTime } from "@/lib/format";
import { developersApi, type Delivery, type Endpoint } from "../api";

export function WebhooksCard() {
  const endpoints = useResource(() => developersApi.endpoints(), []);
  const deliveries = useResource(() => developersApi.deliveries(), []);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState<{ title: string; value: string } | null>(null);
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith("https://")) { setError("Use an https:// address on your server."); return; }
    const ep = await run(() => developersApi.createEndpoint({ url: url.trim(), events: ["*"] }));
    if (ep) { setSecret({ title: "Webhook signing secret", value: ep.secret }); setUrl(""); endpoints.reload(); }
  };
  const rotate = async (ep: Endpoint) => {
    if (!(await confirm({ title: "Rotate the signing secret?", body: "Update your server with the new secret: events signed with it start now.", confirmLabel: "Rotate" }))) return;
    const r = await run(() => developersApi.rotateSecret(ep.id));
    if (r) setSecret({ title: "New webhook signing secret", value: r.secret });
  };
  const remove = async (ep: Endpoint) => {
    if (!(await confirm({ title: "Delete this endpoint?", body: ep.url, confirmLabel: "Delete", danger: true }))) return;
    if (await run(() => developersApi.deleteEndpoint(ep.id))) { toast("Endpoint deleted"); endpoints.reload(); }
  };
  const retry = async (d: Delivery) => {
    if (await run(() => developersApi.retry(d.id))) { toast("Delivery queued"); deliveries.reload(); }
  };

  const epColumns: Column<Endpoint>[] = [
    { key: "url", header: "URL", cell: (ep) => <span className="mono small break">{ep.url}</span> },
    { key: "status", header: "Status", cell: (ep) => <StatusBadge status={ep.active ? "active" : "inactive"} /> },
    { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (ep) => (
      <div className="cluster" style={{ justifyContent: "flex-end" }}><Button size="sm" onClick={() => rotate(ep)}>Rotate secret</Button><Button size="sm" variant="ghost" onClick={() => remove(ep)}>Delete</Button></div>
    ) },
  ];
  const dlColumns: Column<Delivery>[] = [
    { key: "event", header: "Event", cell: (d) => <span className="mono small">{d.event_type}</span> },
    { key: "status", header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
    { key: "attempts", header: "Attempts", align: "right", cell: (d) => <span className="num">{d.attempts}</span> },
    { key: "answer", header: "Last answer", cell: (d) => <span className="small muted">{[d.last_status_code || "", d.last_error].filter(Boolean).join(" ") || "—"}</span> },
    { key: "when", header: "Delivered", cell: (d) => <span className="small muted">{d.delivered_at ? dateTime(d.delivered_at) : "—"}</span> },
    { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (d) => d.status !== "delivered" && <Button size="sm" icon="refresh" onClick={() => retry(d)}>Retry</Button> },
  ];

  return (
    <>
      <Card title="Webhooks" description="We send signed events (payment succeeded, refund, payout, dispute) to your server. Verify the signature with the secret.">
        <div className="stack">
          {secret && <SecretReveal title={secret.title} value={secret.value} onDone={() => setSecret(null)} />}
          <form className="form-grid" onSubmit={add} style={{ alignItems: "end" }}>
            <Input label="Endpoint URL" type="url" required placeholder="https://shop.example/webhooks/paygate" value={url} onChange={(e) => setUrl(e.target.value)} />
            <div><Button type="submit" variant="primary" icon="plus" loading={busy}>Add endpoint</Button></div>
          </form>
          <ErrorText error={error} />
        </div>
        <div style={{ margin: "20px -20px -20px", borderTop: "1px solid var(--color-border)" }}>
          <DataTable label="Webhook endpoints" columns={epColumns} rows={endpoints.data?.data} rowKey={(ep) => ep.id} loading={endpoints.loading}
            empty={<EmptyState icon="link" title="No endpoints yet" />} />
        </div>
      </Card>
      <Card title="Recent deliveries" actions={<Button size="sm" variant="ghost" icon="refresh" onClick={deliveries.reload}>Refresh</Button>} flush>
        <DataTable label="Webhook deliveries" columns={dlColumns} rows={deliveries.data?.data} rowKey={(d) => d.id} loading={deliveries.loading}
          empty={<EmptyState icon="inbox" title="No deliveries yet" description="Events appear here once payments happen." />} />
      </Card>
    </>
  );
}
