"use client";
import { useState } from "react";
import { Button, Card, ErrorText, Input, useConfirm, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { newIdempotencyKey } from "@/lib/api/client";
import { money, toMinor } from "@/lib/format";
import { paymentsApi } from "../api";
import type { Payment } from "../types";

export function RefundForm({ payment, refundable, onDone }: { payment: Payment; refundable: number; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  // One key per refund attempt: a double click or a retry after a network
  // error is the same refund. A new key only after a refund succeeded.
  const [key, setKey] = useState(newIdempotencyKey);
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let minor = refundable;
    try { if (amount.trim()) minor = toMinor(amount); } catch (err) { setError((err as Error).message); return; }
    if (minor > refundable) { setError(`At most ${money(refundable, payment.currency)} can be refunded.`); return; }
    const ok = await confirm({ title: `Refund ${money(minor, payment.currency)}?`, body: "The money goes back to the customer. This cannot be undone.", confirmLabel: "Refund", danger: true });
    if (!ok) return;
    const done = await run(() => paymentsApi.refund({ payment_id: payment.id, amount: minor, reason: reason.trim() || undefined }, key));
    if (done) {
      setKey(newIdempotencyKey()); setAmount(""); setReason("");
      toast(`Refund of ${money(minor, payment.currency)} started`);
      onDone();
    }
  };

  return (
    <Card id="refund" title="Refund" description={`Up to ${money(refundable, payment.currency)} can be refunded.`}>
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <Input label={`Amount (${payment.currency})`} inputMode="decimal" placeholder={(refundable / 100).toFixed(2)} hint="Leave empty to refund the full remaining amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Reason" optional maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <ErrorText error={error} />
        <div><Button type="submit" variant="danger" loading={busy}>Refund payment</Button></div>
      </form>
    </Card>
  );
}
