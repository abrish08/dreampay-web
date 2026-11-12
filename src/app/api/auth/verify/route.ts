import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { setTokens, type Tokens } from "@/lib/server/session";
import { callAPI, readJSON } from "@/lib/server/upstream";

// POST {email, code}: the 6-digit code from the email; signs the user in.
// POST {email, resend: true}: sends a new code.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const b = await req.json().catch(() => ({}));
  const path = b.resend ? "/auth/verify/resend" : "/auth/verify";
  const res = await callAPI(path, { method: "POST", body: JSON.stringify({ email: b.email, code: b.code }) });
  const data = await readJSON(res);
  if (!res.ok || b.resend) return NextResponse.json(data, { status: res.status });
  const out = NextResponse.json({ ok: true });
  setTokens(out, data as unknown as Tokens);
  return out;
}
