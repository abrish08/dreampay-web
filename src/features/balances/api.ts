import { api } from "@/lib/api/client";
import type { Environment } from "@/providers/EnvProvider";

export type Balance = { currency: string; environment: string; available: number; reserved: number; dispute_hold: number; pending_payouts: number; pending_refunds?: number };

export const balancesApi = {
  get: (currency: string, env: Environment) => api<Balance>(`v1/balance?currency=${currency}&environment=${env}`),
};
