import { api, seg, type Page } from "@/lib/api/client";
import type { Payment, PaymentEvent, Refund } from "./types";

export const paymentsApi = {
  list: (q: URLSearchParams) => api<Page<Payment>>(`v1/payments?${q}`),
  get: (id: string) => api<Payment>(`v1/payments/${seg(id)}`),
  events: (id: string) => api<Page<PaymentEvent>>(`v1/payments/${seg(id)}/events`),
  refunds: (id: string) => api<Page<Refund>>(`v1/refunds?payment_id=${seg(id)}`),
  refund: (body: { payment_id: string; amount?: number; reason?: string }, idempotencyKey: string) =>
    api<Refund>("v1/refunds", { method: "POST", body, idempotencyKey }),
};
