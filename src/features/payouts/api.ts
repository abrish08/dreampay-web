import { api, type Page } from "@/lib/api/client";

export type Payout = {
  id: string; environment: string; amount: number; currency: string; status: string;
  bank_name: string; account_number: string; account_name: string; description?: string;
  bank_reference?: string; failure_reason?: string; paid_at?: string; created_at: string;
};
export type PayoutInput = {
  amount: number; currency: string; environment: string; description?: string;
  bank_account: { bank_name: string; account_number: string; account_name: string };
};

export const payoutsApi = {
  list: (env: string) => api<Page<Payout>>(`v1/payouts?environment=${env}`),
  request: (input: PayoutInput, idempotencyKey: string) => api<Payout>("v1/payouts", { method: "POST", body: input, idempotencyKey }),
};
