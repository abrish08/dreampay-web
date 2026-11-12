"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { methodInfo } from "@/features/payments/methods";
import { money } from "@/lib/format";
import type { MethodShare } from "../stats";
import s from "./Analytics.module.css";

/** Share of revenue per payment method: a segmented bar and its legend table. */
export function MethodsCard({ methods, currency, loading }: { methods: MethodShare[]; currency: string; loading?: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  const dim = (m: string) => hover !== null && hover !== m;
  return (
    <section className={s.card}>
      <div className={s.cardHead}>
        <div className={s.cardTitle}>Payment methods</div>
        <Link href="/reports" className={s.detailsBtn}>Details</Link>
      </div>
      {methods.length === 0 ? (
        <div className={s.methodsEmpty}>{loading ? "Loading…" : "No successful payments in this period."}</div>
      ) : (
        <>
          <div className={s.stack} role="img" aria-label={methods.map((m) => `${methodInfo(m.method).label} ${(m.share * 100).toFixed(0)}%`).join(", ")}>
            {methods.map((m) => (
              <span key={m.method} className={s.segment} data-dim={dim(m.method) || undefined}
                style={{ flexGrow: Math.max(m.share, 0.02), background: methodInfo(m.method).color }}
                onPointerEnter={() => setHover(m.method)} onPointerLeave={() => setHover(null)}
                title={`${methodInfo(m.method).label}: ${(m.share * 100).toFixed(1)}%`} />
            ))}
          </div>
          <table className={s.methods}>
            <thead><tr><th scope="col">Channel</th><th scope="col">Share</th><th scope="col">Total</th></tr></thead>
            <tbody>
              {methods.map((m) => {
                const info = methodInfo(m.method);
                return (
                  <tr key={m.method} data-dim={dim(m.method) || undefined} onPointerEnter={() => setHover(m.method)} onPointerLeave={() => setHover(null)}>
                    <td><span className={s.legendDot} style={{ background: info.color }} />{info.label}</td>
                    <td className="num">{(m.share * 100).toFixed(m.share < 0.1 ? 1 : 0)}%</td>
                    <td className="num" title={`${m.count} payments`}>{money(m.amount, currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={s.hint}><Icon name="info" size={13} />Successful payments, by amount</p>
        </>
      )}
    </section>
  );
}
