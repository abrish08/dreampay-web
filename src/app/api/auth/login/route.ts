import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { setMfaToken, setTokens, type Tokens } from "@/lib/server/session";
import { callAPI, readJSON } from "@/lib/server/upstream";

// POST {email, password}. With MFA on, only a short-lived second-step token is
// kept (httpOnly) and the page asks for the authenticator code.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const b = await req.json().catch(() => ({}));
  const res = await callAPI("/auth/login", { method: "POST", body: JSON.stringify({ email: b.email, password: b.password }) });
  const data = await readJSON(res);
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  if (data.mfa_required) {
    const out = NextResponse.json({ mfa_required: true });
    setMfaToken(out, String(data.mfa_token));
    return out;
  }
  const out = NextResponse.json({ ok: true });
  setTokens(out, data as unknown as Tokens);
  return out;
}
