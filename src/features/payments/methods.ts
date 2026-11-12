import type { IconName } from "@/components/ui/Icon";

// Each payment method keeps the same colour everywhere (chart, legend, table).
export type MethodInfo = { label: string; icon: IconName; color: string };

const METHODS: Record<string, MethodInfo> = {
  telebirr: { label: "telebirr", icon: "phone", color: "var(--series-1)" },
  cbe_birr: { label: "CBE Birr", icon: "phone", color: "var(--series-2)" },
  mpesa: { label: "M-Pesa", icon: "phone", color: "var(--series-3)" },
  card: { label: "Card", icon: "card", color: "var(--series-4)" },
  bank_transfer: { label: "Bank transfer", icon: "bank", color: "var(--series-5)" },
};

export const methodInfo = (m?: string | null): MethodInfo =>
  (m && METHODS[m]) || { label: m ? m.replaceAll("_", " ") : "Not chosen", icon: "wallet", color: "var(--series-other)" };

export const METHOD_ORDER = Object.keys(METHODS);
