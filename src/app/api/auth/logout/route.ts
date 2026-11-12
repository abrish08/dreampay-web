import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { clearSession, readCookie, REFRESH } from "@/lib/server/session";
import { callAPI } from "@/lib/server/upstream";

// POST: revokes the refresh token at the API and clears the cookies.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const rt = await readCookie(REFRESH);
  if (rt) await callAPI("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: rt }) }).catch(() => undefined);
  const out = NextResponse.json({ ok: true });
  clearSession(out);
  return out;
}
