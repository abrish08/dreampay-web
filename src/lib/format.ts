// Formatting helpers. Amounts are always integers in minor units (cents).

export const CURRENCIES = ["ETB", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function money(minor: number | null | undefined, currency = "ETB"): string {
  const value = (minor ?? 0) / 100;
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/** Parses "1,250.50" into 125050 without floating point errors. */
export function toMinor(input: string): number {
  const v = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(v)) throw new Error("Enter an amount like 1250 or 1250.50");
  const [whole, frac = ""] = v.split(".");
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0) throw new Error("Enter an amount greater than zero");
  return minor;
}

export function dateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function dateOnly(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

/** "needs_response" -> "needs response" */
export const humanize = (s?: string | null) => (s ?? "").replaceAll("_", " ");

export const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/** yyyy-mm-dd in local time, for <input type="date">. */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
