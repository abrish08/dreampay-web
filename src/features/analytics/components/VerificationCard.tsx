"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { api } from "@/lib/api/client";
import s from "./Analytics.module.css";

type Kyc = { status: string; missing: string[]; required_documents: string[] };
const BARS = 36;
const FIELDS = 11; // profile items the API checks before submission

/** How far the business is in verification, as a segmented meter. */
export function VerificationCard() {
  const { data } = useResource(() => api<Kyc>("v1/kyc"), []);
  const status = data?.status ?? "";
  const verified = status === "approved" || status === "waived";
  const total = data ? Math.max(data.missing.length, FIELDS + data.required_documents.length) : 1;
  const done = verified ? 1 : status === "submitted" ? 0.95 : data ? (total - data.missing.length) / total : 0;
  const pct = Math.round(done * 100);
  const lit = Math.round(done * BARS);
  const text = verified ? "Live payments are on." : status === "submitted" ? "In review. We will email you soon." : status === "rejected" ? "Changes needed. Open the details." : `${data?.missing.length ?? "…"} items left before you can submit.`;

  return (
    <section className={s.card}>
      <div className={s.cardHead}>
        <div className={s.cardTitle}><Icon name="badge" size={17} />Verification</div>
        <Link href="/kyc" className={s.detailsBtn}>Details</Link>
      </div>
      <div className={s.verifyRow}>
        <div>
          <div className={s.verifyBig}>{verified ? <>Your business is <strong>verified</strong></> : <>Your business is <strong>{pct}%</strong> verified</>}</div>
          <div className={s.verifyText}>{text}</div>
        </div>
        <span className={s.verifyBadge} data-ok={verified || undefined}><Icon name={verified ? "verified" : "lock"} size={20} /></span>
      </div>
      <div className={s.meter} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Verification progress">
        {Array.from({ length: BARS }, (_, i) => <span key={i} data-on={i < lit || undefined} />)}
      </div>
    </section>
  );
}
