import { cx } from "@/lib/cx";
import { humanize } from "@/lib/format";
import s from "./Badge.module.css";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneOf: Record<string, Tone> = {
  succeeded: "success", active: "success", delivered: "success", approved: "success", paid: "success", won: "success", waived: "success",
  failed: "danger", rejected: "danger", lost: "danger", revoked: "danger", expired: "neutral", inactive: "neutral",
  processing: "warning", pending: "warning", needs_response: "warning", requested: "warning", retrying: "warning",
  success: "success", denied: "danger", rate_limited: "warning", error: "danger",
  submitted: "info", under_review: "info", partially_refunded: "info", refunded: "info", draft: "neutral", not_started: "neutral",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={cx(s.badge, tone !== "neutral" && s[tone])}>{children}</span>;
}

/** A status from the API, coloured by meaning. */
export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return <Badge tone={toneOf[status] ?? "neutral"}>{humanize(status)}</Badge>;
}
