import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { MFA, readCookie, setTokens, type Tokens } from "@/lib/server/session";
import { callAPI, readJSON } from "@/lib/server/upstream";

// POST {code}: second step of a sign-in (authenticator or recovery code).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const token = await readCookie(MFA);
  if (!token) return NextResponse.json({ error: { code: "mfa_expired", message: "The sign-in took too long. Enter your password again." } }, { status: 401 });
  const { code } = await req.json().catch(() => ({}));
  const res = await callAPI("/auth/login/mfa", { method: "POST", body: JSON.stringify({ mfa_token: token, code }) });
  const data = await readJSON(res);
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  const out = NextResponse.json({ ok: true });
  setTokens(out, data as unknown as Tokens);
  return out;
}
