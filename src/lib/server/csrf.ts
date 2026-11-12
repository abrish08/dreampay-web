import "server-only";
import { NextResponse } from "next/server";

// State-changing calls must come from this app's own pages: a custom header
// (which cross-site forms cannot set) and, when sent, a same-host Origin.
export function sameOrigin(req: Request): boolean {
  if (req.headers.get("x-requested-with") !== "paygate-web") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const forbidden = () => NextResponse.json({ error: { code: "csrf", message: "forbidden" } }, { status: 403 });
