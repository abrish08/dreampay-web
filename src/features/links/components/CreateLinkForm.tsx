"use client";
import { useState } from "react";
import { Button, Card, Checkbox, CopyButton, ErrorText, Input, Select, Alert } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { CURRENCIES, toMinor } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { linksApi, type PaymentLink } from "../api";

const empty = { amount: "", currency: "ETB", description: "", reference: "", single_use: true };

export function CreateLinkForm({ onCreated }: { onCreated: () => void }) {
  const { env } = useEnv();
  const [f, setF] = useState(empty);
  const [created, setCreated] = useState<PaymentLink | null>(null);
  const { busy, error, setError, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let amount: number;
    try { amount = toMinor(f.amount); } catch (err) { setError((err as Error).message); return; }
    const link = await run(() => linksApi.create({ ...f, amount, environment: env }));
    if (link) { setCreated(link); setF(empty); onCreated(); }
  };

  return (
    <Card title="Create a payment link" description="Share it in chat, SMS or email. The customer pays on the secure checkout page.">
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <Input label="Amount" required inputMode="decimal" placeholder="500.00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <Select label="Currency" options={CURRENCIES} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} />
          <Input label="Description" optional maxLength={200} placeholder="Blue T-shirt, size M" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <Input label="Reference" optional maxLength={60} placeholder="INV-77" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
        </div>
        <Checkbox label="Single use" hint="Like an invoice: the link closes after one payment." checked={f.single_use} onChange={(e) => setF({ ...f, single_use: e.target.checked })} />
        <ErrorText error={error} />
        <div><Button type="submit" variant="primary" icon="plus" loading={busy}>Create link</Button></div>
        {created && (
          <Alert tone="success" title="Your link is ready" action={<CopyButton value={created.url} label="Copy link" />}>
            <span className="mono break small">{created.url}</span>
          </Alert>
        )}
      </form>
    </Card>
  );
}
