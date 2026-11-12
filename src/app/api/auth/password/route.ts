import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { callAPI, readJSON } from "@/lib/server/upstream";

// POST {email}: sends a reset link. POST {token, new_password}: sets the new password.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const b = await req.json().catch(() => ({}));
  const res = b.token
    ? await callAPI("/auth/password/reset", { method: "POST", body: JSON.stringify({ token: b.token, new_password: b.new_password }) })
    : await callAPI("/auth/password/forgot", { method: "POST", body: JSON.stringify({ email: b.email }) });
  return NextResponse.json(await readJSON(res), { status: res.status });
}
