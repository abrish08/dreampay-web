import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { refreshOnce, TOKEN_ERRORS } from "@/lib/server/refresh";
import { ACCESS, clearSession, readCookie, REFRESH, setTokens, type Tokens } from "@/lib/server/session";
import { callAPI, readJSON } from "@/lib/server/upstream";

// The dashboard's only way to the Go API. Allow-list: merchant routes and the
// user's own profile / MFA / password. Never /admin (staff have their own console).
const ALLOWED = [/^v1\//, /^auth\/me$/, /^auth\/mfa(\/totp\/(setup|confirm|disable))?$/, /^auth\/password$/];
const MAX_BODY = 30 * 1024 * 1024; // dispute evidence: 5 files of 5 MB plus form overhead

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (path.some((p) => p === ".." || p === ".")) return notAllowed();
  const p = path.map(encodeURIComponent).join("/");
  if (!ALLOWED.some((re) => re.test(p))) return notAllowed();
  if (req.method !== "GET" && !sameOrigin(req)) return forbidden();

  const search = new URL(req.url).search;
  const headers: Record<string, string> = {};
  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) {
      return NextResponse.json({ error: { code: "too_large", message: "The upload is too large." } }, { status: 413 });
    }
    init.body = await req.arrayBuffer();
    const ctype = req.headers.get("content-type");
    if (ctype) headers["Content-Type"] = ctype;
  }
  const idem = req.headers.get("idempotency-key");
  if (idem) headers["Idempotency-Key"] = idem;

  let access = await readCookie(ACCESS);
  let refreshed: Tokens | undefined;
  let res = access ? await callAPI(`/${p}${search}`, init, access) : undefined;

  // Refresh only when the access token itself is the problem (missing,
  // expired, stale). Other 401s, e.g. a wrong authenticator code, go back to
  // the page as normal errors and never sign the user out.
  if (!res || (res.status === 401 && TOKEN_ERRORS.has(await errorCode(res)))) {
    const rt = await readCookie(REFRESH);
    if (!rt) return unauthorized();
    const tokens = await refreshOnce(rt);
    if (!tokens) return unauthorized();
    refreshed = tokens;
    access = tokens.access_token;
    res = await callAPI(`/${p}${search}`, init, access);
  }

  let out: NextResponse;
  if (res.status === 204) {
    out = new NextResponse(null, { status: 204 });
  } else if ((res.headers.get("content-type") ?? "").includes("application/json")) {
    out = NextResponse.json(await readJSON(res), { status: res.status });
  } else {
    // Files (CSV reports, dispute evidence): stream through with their headers.
    out = new NextResponse(res.body, { status: res.status });
    for (const h of ["content-type", "content-disposition", "content-length"]) {
      const v = res.headers.get(h);
      if (v) out.headers.set(h, v);
    }
  }
  out.headers.set("Cache-Control", "no-store");
  if (refreshed) setTokens(out, refreshed);
  return out;
}

/** The API's error code of a response, read from a copy so the body can still be forwarded. */
async function errorCode(res: Response): Promise<string> {
  try {
    const data = (await res.clone().json()) as { error?: { code?: string } };
    return data.error?.code ?? "";
  } catch {
    return "";
  }
}

const notAllowed = () => NextResponse.json({ error: { code: "not_allowed", message: "Not available from the dashboard." } }, { status: 404 });

function unauthorized() {
  const out = NextResponse.json({ error: { code: "session_expired", message: "Please sign in again." } }, { status: 401 });
  clearSession(out);
  return out;
}

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT };
