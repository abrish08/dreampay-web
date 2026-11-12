import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

// Session cookies. Tokens live in httpOnly cookies; only this server reads them.
export const ACCESS = "pg_at";
export const REFRESH = "pg_rt";
export const MFA = "pg_mfa"; // short-lived second step of a sign-in

const secure = process.env.NODE_ENV === "production";

export type Tokens = { access_token: string; refresh_token: string; expires_in: number; refresh_expires_at?: string };

export function setTokens(res: NextResponse, t: Tokens) {
  res.cookies.set(ACCESS, t.access_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: Math.max(60, t.expires_in - 15) });
  const refreshAge = t.refresh_expires_at
    ? Math.max(60, Math.floor((Date.parse(t.refresh_expires_at) - Date.now()) / 1000))
    : 7 * 24 * 3600;
  res.cookies.set(REFRESH, t.refresh_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: refreshAge });
  res.cookies.delete(MFA);
}

export function setMfaToken(res: NextResponse, token: string) {
  res.cookies.set(MFA, token, { httpOnly: true, secure, sameSite: "strict", path: "/api/auth", maxAge: 300 });
}

export function clearSession(res: NextResponse) {
  for (const n of [ACCESS, REFRESH]) res.cookies.delete(n);
  res.cookies.set(MFA, "", { path: "/api/auth", maxAge: 0 });
}

export async function readCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}
