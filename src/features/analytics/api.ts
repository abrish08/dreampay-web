import { paymentsApi, type Payment } from "@/features/payments";

const PAGE = 100;
export const MAX_PAYMENTS = 3000;

const rfc3339 = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

/** Every payment created in [from, to), newest first, up to MAX_PAYMENTS. */
export async function paymentsBetween(environment: string, from: Date, to: Date, signal?: AbortSignal) {
  const rows: Payment[] = [];
  let after: string | undefined;
  for (;;) {
    const q = new URLSearchParams({ environment, limit: String(PAGE), created_from: rfc3339(from), created_to: rfc3339(to) });
    if (after) q.set("starting_after", after);
    const page = await paymentsApi.list(q);
    if (signal?.aborted) throw new DOMException("aborted", "AbortError");
    rows.push(...page.data);
    if (!page.has_more || !page.next_cursor) return { rows, complete: true };
    if (rows.length >= MAX_PAYMENTS) return { rows, complete: false };
    after = page.next_cursor;
  }
}
