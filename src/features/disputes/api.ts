import { api, seg, type Page } from "@/lib/api/client";

export type DisputeFile = { id: string; name: string; content_type: string; size: number; created_at: string };
export type DisputeHistory = { id: string; action: string; actor: string; note?: string; created_at: string };
export type Dispute = {
  id: string; payment_id: string; environment: string; amount: number; currency: string; status: string;
  reason_code: string; reason?: string; evidence_due_by: string; evidence_text?: string; evidence_submitted_at?: string;
  files: DisputeFile[]; outcome?: string; fee?: number; note?: string; closed_at?: string; created_at: string; history?: DisputeHistory[];
};

export const disputesApi = {
  list: () => api<Page<Dispute>>("v1/disputes"),
  get: (id: string) => api<Dispute>(`v1/disputes/${seg(id)}`),
  saveEvidence: (id: string, form: FormData) => api<Dispute>(`v1/disputes/${seg(id)}/evidence`, { method: "POST", form }),
  submit: (id: string) => api<Dispute>(`v1/disputes/${seg(id)}/submit`, { method: "POST" }),
  accept: (id: string) => api<Dispute>(`v1/disputes/${seg(id)}/accept`, { method: "POST" }),
  fileUrl: (id: string, fileId: string) => `/api/proxy/v1/disputes/${seg(id)}/files/${seg(fileId)}`,
};

export function daysLeft(due: string): number {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 864e5);
}
