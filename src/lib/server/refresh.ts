import "server-only";
import { createHash } from "node:crypto";
import type { Tokens } from "./session";
import { callAPI } from "./upstream";

// Refresh tokens are single-use: the API treats a second use as theft and
// signs the user out everywhere. A page sends several requests at once, so
// when the access token expires they must share ONE refresh. Requests that
// still carry the old cookie for a few seconds afterwards get the same new
// tokens instead of reusing the old refresh token.
const SHARE_FOR_MS = 30_000;
const recent = new Map<string, { at: number; result: Promise<Tokens | null> }>();

export function refreshOnce(refreshToken: string): Promise<Tokens | null> {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.at > SHARE_FOR_MS) recent.delete(k);
  const key = createHash("sha256").update(refreshToken).digest("hex"); // never keep the raw token as a key
  const hit = recent.get(key);
  if (hit) return hit.result;
  const result = callAPI("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) })
    .then(async (r) => (r.ok ? ((await r.json()) as Tokens) : null))
    .catch(() => null);
  recent.set(key, { at: now, result });
  return result;
}

/** API errors that mean "the access token is no longer good" (a refresh can fix them). */
export const TOKEN_ERRORS = new Set(["token_expired", "invalid_token", "token_stale", "missing_credentials"]);
