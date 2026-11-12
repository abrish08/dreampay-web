"use client";
import { useState } from "react";
import { Button, Card, ErrorText, Input, Select, useConfirm, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { newIdempotencyKey } from "@/lib/api/client";
import { CURRENCIES, money, toMinor, type Currency } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { payoutsApi } from "../api";

const BANKS = ["Commercial Bank of Ethiopia", "Awash Bank", "Dashen Bank", "Bank of Abyssinia", "Wegagen Bank", "United Bank (Hibret)", "Nib International Bank", "Cooperative Bank of Oromia", "Zemen Bank", "Bunna Bank", "Berhan Bank", "Abay Bank", "Enat Bank", "Oromia Bank", "Amhara Bank", "Other"];

export function PayoutForm({ currency, onCurrency, available, onDone }: { currency: Currency; onCurrency: (c: Currency) => void; available?: number; onDone: () => void }) {
  const { env } = useEnv();
  const [f, setF] = useState({ amount: "", bank_name: "", account_number: "", account_name: "", description: "" });
  const [key, setKey] = useState(newIdempotencyKey); // same key on retry: one payout
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let amount: number;
    try { amount = toMinor(f.amount); } catch (err) { setError((err as Error).message); return; }
    if (available !== undefined && amount > available) { setError(`Only ${money(available, currency)} is available.`); return; }
    if (!/^\d{6,20}$/.test(f.account_number.replace(/\s/g, ""))) { setError("Enter the account number as digits only."); return; }
    const ok = await confirm({
      title: `Pay out ${money(amount, currency)}?`,
      body: <>To <strong>{f.account_name}</strong>, {f.bank_name} account <span className="mono">{f.account_number}</span>. Check the details: money sent to a wrong account may not come back.</>,
      confirmLabel: "Request payout",
    });
    if (!ok) return;
    const done = await run(() => payoutsApi.request({
      amount, currency, environment: env, description: f.description.trim() || undefined,
      bank_account: { bank_name: f.bank_name, account_number: f.account_number.replace(/\s/g, ""), account_name: f.account_name.trim() },
    }, key));
    if (done) { setKey(newIdempotencyKey()); setF({ ...f, amount: "", description: "" }); toast("Payout requested"); onDone(); }
  };

  return (
    <Card title="Request a payout" description="The amount is held immediately. Our finance team sends the bank transfer, usually the same business day.">
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <Input label="Amount" required inputMode="decimal" placeholder="1000.00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })}
            hint={available !== undefined ? `Available: ${money(available, currency)}` : undefined} />
          <Select label="Currency" options={CURRENCIES} value={currency} onChange={(e) => onCurrency(e.target.value as Currency)} />
          <Select label="Bank" required placeholder="Choose a bank" options={BANKS} value={f.bank_name} onChange={(e) => setF({ ...f, bank_name: e.target.value })} />
          <Input label="Account number" required inputMode="numeric" autoComplete="off" value={f.account_number} onChange={(e) => setF({ ...f, account_number: e.target.value })} />
          <Input label="Account holder name" required hint="As registered at the bank" value={f.account_name} onChange={(e) => setF({ ...f, account_name: e.target.value })} />
          <Input label="Note" optional maxLength={140} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <ErrorText error={error} />
        <div><Button type="submit" variant="primary" icon="bank" loading={busy}>Request payout</Button></div>
      </form>
    </Card>
  );
}
