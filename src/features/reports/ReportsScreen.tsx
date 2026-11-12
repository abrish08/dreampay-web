"use client";
import { useState } from "react";
import { Alert, ButtonLink, Card, Input, PageHeader, Select } from "@/components/ui";
import { CURRENCIES, isoDay } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";

const MAX_DAYS = 93;

export function ReportsScreen() {
  const { env } = useEnv();
  const [from, setFrom] = useState(isoDay(new Date(Date.now() - 30 * 864e5)));
  const [to, setTo] = useState(isoDay(new Date()));
  const [currency, setCurrency] = useState("ETB");

  const days = (Date.parse(to) - Date.parse(from)) / 864e5;
  const problem = !from || !to ? "Choose both dates." : days < 0 ? "The start date must be before the end date." : days + 1 > MAX_DAYS ? `Choose at most ${MAX_DAYS} days.` : "";
  // "to" is inclusive for people; the API's end is exclusive.
  const end = to ? isoDay(new Date(Date.parse(to) + 864e5)) : "";
  const q = new URLSearchParams({ environment: env, from, to: end });

  return (
    <>
      <PageHeader title="Reports" description="Download your data as CSV. Files open safely in Excel and Google Sheets." />
      <div className="stack">
        <Card title="Period">
          <div className="form-grid">
            <Input label="From" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} hint={`Up to ${MAX_DAYS} days`} />
          </div>
          {problem && <div style={{ marginTop: 16 }}><Alert tone="warning">{problem}</Alert></div>}
        </Card>
        <div className="form-grid">
          <Card title="Payments" description="Every payment with amount, fee, refunds, reserve, method and customer email.">
            <ButtonLink variant="primary" icon="download" href={problem ? undefined : `/api/proxy/v1/reports/payments.csv?${q}`} aria-disabled={!!problem}>Download payments</ButtonLink>
          </Card>
          <Card title="Balance statement" description="Every movement of your balance, with the running total. Use it for accounting.">
            <div className="stack">
              <Select label="Currency" options={CURRENCIES} value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <div><ButtonLink icon="download" href={problem ? undefined : `/api/proxy/v1/reports/statement.csv?${q}&currency=${currency}`} aria-disabled={!!problem}>Download statement</ButtonLink></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
