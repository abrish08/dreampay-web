import { api } from "@/lib/api/client";

export type AuditEntry = {
  id: number;
  occurred_at: string;
  actor_kind: string;
  actor_id?: string;
  actor_label?: string;
  merchant_id?: string;
  environment?: string;
  action: string;
  method?: string;
  route?: string;
  resource_type?: string;
  resource_id?: string;
  outcome: "success" | "denied" | "rejected" | "rate_limited" | "error";
  status?: number;
  error_code?: string;
  ip?: string;
  user_agent?: string;
  correlation_id?: string;
  details?: Record<string, string>;
};

export type AuditPage = { data: AuditEntry[]; has_more: boolean; next_cursor?: number };

/** Always your own business: the API takes the merchant from your sign-in. */
export const activityApi = {
  list: (q: URLSearchParams) => api<AuditPage>(`v1/audit-logs?${q}`),
};

export const AREAS = [
  { value: "", label: "Everything" },
  { value: "payments.", label: "Payments" },
  { value: "refunds.", label: "Refunds" },
  { value: "payouts.", label: "Payouts" },
  { value: "payment_links.", label: "Payment links" },
  { value: "api_keys.", label: "API keys" },
  { value: "webhook_", label: "Webhooks" },
  { value: "team.", label: "Team" },
  { value: "roles.", label: "Roles" },
  { value: "kyc.", label: "Business verification" },
  { value: "disputes.", label: "Disputes" },
  { value: "reports.", label: "Reports" },
  { value: "auth.", label: "Sign-in & security" },
];

export const OUTCOMES = [
  { value: "", label: "Any result" },
  { value: "success", label: "Succeeded" },
  { value: "denied", label: "Denied" },
  { value: "rejected", label: "Rejected" },
  { value: "rate_limited", label: "Rate limited" },
  { value: "error", label: "Error" },
];

/** "api_keys.roll" -> "API keys · roll" */
export function describeAction(action: string): string {
  const parts = action.split(".");
  const verb = parts.length > 1 ? parts.pop()! : "";
  const area = parts.join(" ").replaceAll("_", " ").replace(/\bapi\b/i, "API").replace(/\bkyc\b/i, "KYC").replace(/\bmfa\b/i, "MFA");
  const v = { create: "created", update: "updated", delete: "deleted", view: "viewed", list: "listed", export: "exported" }[verb] ?? verb.replaceAll("_", " ");
  return `${area.charAt(0).toUpperCase()}${area.slice(1)} · ${v}`;
}

export function describeActor(e: AuditEntry, me?: { id: string; name: string } | null): string {
  const short = e.actor_id ? `${e.actor_id.slice(0, 8)}…` : "";
  if (me && e.actor_kind === "user" && e.actor_id === me.id) return `You (${me.name})`;
  switch (e.actor_kind) {
    case "user": return e.actor_label || `Team member ${short}`;
    case "api_key": return `API key ${short}`;
    case "staff": return "Paygate staff";
    case "anonymous": return e.details?.email ? `Sign-in as ${e.details.email}` : "Not signed in";
    default: return e.actor_kind;
  }
}
