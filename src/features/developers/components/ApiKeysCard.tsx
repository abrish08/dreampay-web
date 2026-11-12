"use client";
import { useState } from "react";
import { Button, Card, Checkbox, DataTable, EmptyState, ErrorText, Input, SecretReveal, Select, StatusBadge, useConfirm, useToast, type Column } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useResource } from "@/hooks/useResource";
import { dateTime } from "@/lib/format";
import { developersApi, SCOPES, type ApiKey } from "../api";

export function ApiKeysCard() {
  const keys = useResource(() => developersApi.keys(), []);
  const [f, setF] = useState({ name: "", environment: "test", scopes: ["payments:read", "payments:write"] as string[] });
  const [secret, setSecret] = useState<{ title: string; value: string } | null>(null);
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.scopes.length === 0) { setError("Choose at least one permission."); return; }
    const k = await run(() => developersApi.createKey(f));
    if (k) { setSecret({ title: `API key "${k.name}"`, value: k.secret }); setF({ ...f, name: "" }); keys.reload(); }
  };
  const roll = async (k: ApiKey) => {
    if (!(await confirm({ title: `Roll "${k.name}"?`, body: "You get a new secret. The old one keeps working for a short grace period so you can update your servers.", confirmLabel: "Roll key" }))) return;
    const n = await run(() => developersApi.rollKey(k.id));
    if (n) { setSecret({ title: `New secret for "${k.name}"`, value: n.secret }); keys.reload(); }
  };
  const revoke = async (k: ApiKey) => {
    if (!(await confirm({ title: `Revoke "${k.name}"?`, body: "Servers using this key stop working immediately.", confirmLabel: "Revoke", danger: true }))) return;
    if (await run(() => developersApi.revokeKey(k.id))) { toast("Key revoked"); keys.reload(); }
  };

  const columns: Column<ApiKey>[] = [
    { key: "name", header: "Name", cell: (k) => <span className="strong">{k.name}</span> },
    { key: "key", header: "Key", cell: (k) => <span className="mono small">{k.prefix}…{k.last4}</span> },
    { key: "env", header: "Mode", cell: (k) => <span className="small" style={{ textTransform: "capitalize" }}>{k.environment}</span> },
    { key: "status", header: "Status", cell: (k) => <StatusBadge status={k.status} /> },
    { key: "used", header: "Last used", cell: (k) => <span className="small muted">{k.last_used_at ? dateTime(k.last_used_at) : "Never"}</span> },
    { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (k) => k.status === "active" && (
      <div className="cluster" style={{ justifyContent: "flex-end" }}><Button size="sm" onClick={() => roll(k)}>Roll</Button><Button size="sm" variant="ghost" onClick={() => revoke(k)}>Revoke</Button></div>
    ) },
  ];

  return (
    <Card title="API keys" description="Your server uses these to create payments. Never put a key in a website or mobile app.">
      <div className="stack">
        {secret && <SecretReveal title={secret.title} value={secret.value} onDone={() => setSecret(null)} />}
        <form className="stack" onSubmit={create}>
          <div className="form-grid">
            <Input label="Name" required maxLength={60} placeholder="Web shop server" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <Select label="Mode" options={[{ value: "test", label: "Test" }, { value: "live", label: "Live (needs verification)" }]} value={f.environment} onChange={(e) => setF({ ...f, environment: e.target.value })} />
          </div>
          <fieldset className="cluster" style={{ border: 0, padding: 0, margin: 0, gap: "8px 20px" }}>
            <legend className="small strong" style={{ marginBottom: 6 }}>Permissions</legend>
            {SCOPES.map((sc) => (
              <Checkbox key={sc.value} label={sc.label} checked={f.scopes.includes(sc.value)}
                onChange={(e) => setF({ ...f, scopes: e.target.checked ? [...f.scopes, sc.value] : f.scopes.filter((x) => x !== sc.value) })} />
            ))}
          </fieldset>
          <ErrorText error={error} />
          <div><Button type="submit" variant="primary" icon="plus" loading={busy}>Create key</Button></div>
        </form>
      </div>
      <div style={{ margin: "20px -20px -20px", borderTop: "1px solid var(--color-border)" }}>
        <DataTable label="API keys" columns={columns} rows={keys.data?.data} rowKey={(k) => k.id} loading={keys.loading}
          empty={<EmptyState icon="code" title="No API keys yet" />} />
      </div>
    </Card>
  );
}
