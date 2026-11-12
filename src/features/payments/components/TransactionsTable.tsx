"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Icon, Menu, MenuItem, MenuSeparator, StatusBadge, useToast } from "@/components/ui";
import { cx } from "@/lib/cx";
import { downloadCSV } from "@/lib/csv";
import { dateTime, money } from "@/lib/format";
import { methodInfo } from "../methods";
import type { Payment } from "../types";
import s from "./TransactionsTable.module.css";

type SortKey = "reference" | "amount" | "status" | "created_at" | "method";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const value = (p: Payment, k: SortKey): string | number =>
  k === "amount" ? p.amount : k === "created_at" ? Date.parse(p.created_at) : k === "method" ? methodInfo(p.payment_method).label : (p[k] ?? "");

const initials = (p: Payment) => {
  const name = p.customer_name || p.customer_email || p.reference;
  return name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "·";
};

/**
 * The transactions table of the dashboard: search, sort, select rows,
 * export the selection, and a menu per row.
 */
export function TransactionsTable({ rows, loading, title = "Recent transactions", subtitle, seeAll, footer, emptyText = "No payments yet." }: {
  rows: Payment[]; loading?: boolean; title?: string; subtitle?: string; seeAll?: boolean; footer?: React.ReactNode; emptyText?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "created_at", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? rows.filter((p) => [p.reference, p.id, p.customer_email, p.customer_name, p.customer_phone, p.status, methodInfo(p.payment_method).label, p.description]
      .some((v) => v?.toLowerCase().includes(q))) : rows;
    return [...list].sort((a, b) => {
      const x = value(a, sort.key), y = value(b, sort.key);
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? c : -c;
    });
  }, [rows, query, sort]);

  // Keep only selections that still exist.
  useEffect(() => { setSelected((prev) => new Set([...prev].filter((id) => rows.some((r) => r.id === id)))); }, [rows]);
  const allOn = shown.length > 0 && shown.every((p) => selected.has(p.id));
  const someOn = shown.some((p) => selected.has(p.id));
  useEffect(() => { if (all.current) all.current.indeterminate = someOn && !allOn; }, [someOn, allOn]);

  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allOn ? new Set() : new Set(shown.map((p) => p.id)));
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
  const copy = (text: string, what: string) => navigator.clipboard.writeText(text).then(() => toast(`${what} copied`)).catch(() => {});

  const exportSelected = () => {
    const list = rows.filter((p) => selected.has(p.id));
    downloadCSV(`payments-${list.length}.csv`, ["id", "created_at", "reference", "status", "amount", "currency", "method", "customer_email", "customer_name"],
      list.map((p) => [p.id, p.created_at, p.reference, p.status, (p.amount / 100).toFixed(2), p.currency, p.payment_method ?? "", p.customer_email ?? "", p.customer_name ?? ""]));
    toast(`Exported ${list.length} payment${list.length === 1 ? "" : "s"}`);
  };

  const header = (key: SortKey, label: string) => {
    const on = sort.key === key;
    return (
      <th scope="col" aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button type="button" className={s.sortBtn} data-active={on || undefined} onClick={() => sortBy(key)}>
          {label}<Icon name={on ? (sort.dir === "asc" ? "sortUp" : "sortDown") : "sort"} size={14} />
        </button>
      </th>
    );
  };

  return (
    <div>
      <div className={s.toolbar}>
        <div className={s.titleRow}>
          <span className={s.titleIcon}><Icon name="refresh" size={18} /></span>
          <div><div className={s.title}>{title}</div>{subtitle && <div className={s.subtitle}>{subtitle}</div>}</div>
        </div>
        <div className={s.tools}>
          <label className={s.searchBox}>
            <span className="sr-only">Search transactions</span>
            <Icon name="search" size={16} />
            <input className={s.searchInput} type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {seeAll && <Button onClick={() => router.push("/payments")}>See all</Button>}
        </div>
      </div>

      {selected.size > 0 && (
        <div className={s.bulk} role="status">
          <span className={s.grow}>{selected.size} selected</span>
          <Button size="sm" icon="download" onClick={exportSelected}>Export CSV</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <div className={s.wrap}>
        <table className={s.table} aria-busy={loading || undefined}>
          <thead>
            <tr>
              <th className={s.check}><input ref={all} type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all shown" disabled={!shown.length} /></th>
              {header("reference", "Customer / reference")}
              {header("amount", "Amount")}
              {header("status", "Status")}
              {header("created_at", "Date & time")}
              {header("method", "Payment method")}
              <th className={s.actions}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && Array.from({ length: 4 }, (_, i) => (
              <tr key={`sk${i}`}><td colSpan={7}><div className={s.skeleton} style={{ width: `${85 - i * 12}%` }} /></td></tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={7} className={s.empty}>{query ? `No payments match “${query}”.` : emptyText}</td></tr>
            )}
            {shown.map((p) => {
              const m = methodInfo(p.payment_method);
              const on = selected.has(p.id);
              const open = () => router.push(`/payments/${p.id}`);
              const refundable = (p.status === "succeeded" || p.status === "partially_refunded") && p.amount > p.refunded_amount;
              return (
                <tr key={p.id} data-selected={on || undefined} tabIndex={0}
                  onClick={(e) => { if (!(e.target as HTMLElement).closest("button,a,input,[role=menu]")) open(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) open(); if (e.key === " " && e.target === e.currentTarget) { e.preventDefault(); toggle(p.id); } }}>
                  <td className={s.check}><input type="checkbox" checked={on} onChange={() => toggle(p.id)} aria-label={`Select ${p.reference}`} /></td>
                  <td>
                    <div className={s.who}>
                      <span className={s.whoIcon} aria-hidden="true">{initials(p)}</span>
                      <span className={s.whoText}>
                        <strong>{p.customer_name || p.reference}</strong>
                        <span>{p.customer_name ? p.reference : p.customer_email || p.customer_phone || p.description || "—"}</span>
                      </span>
                    </div>
                  </td>
                  <td className={s.amount}>{money(p.amount, p.currency)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="muted">{dateTime(p.created_at)}</td>
                  <td>
                    <span className={s.method}>
                      <span className={s.methodIcon}><Icon name={m.icon} size={15} /></span>
                      <span className={s.methodDot} style={{ background: m.color }} aria-hidden="true" />{m.label}
                    </span>
                  </td>
                  <td className={s.actions}>
                    <Menu trigger={(t) => <Button {...t} size="sm" variant="ghost" iconOnly icon="more" aria-label={`Actions for ${p.reference}`} />}>
                      <MenuItem icon="external" onSelect={open}>View details</MenuItem>
                      <MenuItem icon="copy" onSelect={() => copy(p.id, "Payment ID")}>Copy payment ID</MenuItem>
                      <MenuItem icon="copy" onSelect={() => copy(p.reference, "Reference")}>Copy reference</MenuItem>
                      {p.checkout_url && (p.status === "pending" || p.status === "processing") && (
                        <MenuItem icon="link" onSelect={() => copy(p.checkout_url!, "Checkout link")}>Copy checkout link</MenuItem>
                      )}
                      {refundable && <><MenuSeparator /><MenuItem icon="refresh" danger onSelect={() => router.push(`/payments/${p.id}#refund`)}>Refund…</MenuItem></>}
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(footer || query) && <div className={cx(s.foot)}><span>{query ? `${shown.length} of ${rows.length} shown` : ""}</span>{footer}</div>}
    </div>
  );
}
