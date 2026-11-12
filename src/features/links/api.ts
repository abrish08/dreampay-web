import { api, seg, type Page } from "@/lib/api/client";

export type PaymentLink = {
  id: string; url: string; environment: string; amount: number; currency: string; description?: string; reference?: string;
  single_use: boolean; active: boolean; expires_at?: string; paid_count: number; created_at: string;
};
export type LinkInput = { amount: number; currency: string; description: string; reference: string; single_use: boolean; environment: string };

export const linksApi = {
  list: (env: string) => api<Page<PaymentLink>>(`v1/payment-links?environment=${env}`),
  create: (input: LinkInput) => api<PaymentLink>("v1/payment-links", { method: "POST", body: input }),
  deactivate: (id: string) => api(`v1/payment-links/${seg(id)}/deactivate`, { method: "POST" }),
};
