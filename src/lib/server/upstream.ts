import "server-only";

// Calls from this server to the Go API.
export const API_URL = apiURL(process.env.PAYGATE_API_URL);

/**
 * PAYGATE_API_URL must be a full URL (http://localhost:8080). A bare
 * "localhost:8080" is accepted with a warning; anything else stops with a
 * clear message instead of failing every request with "unknown scheme".
 */
function apiURL(raw: string | undefined): string {
  let v = (raw ?? "").trim() || "http://localhost:8080";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) {
    console.warn(`PAYGATE_API_URL="${v}" has no http:// or https://; using http://${v}`);
    v = `http://${v}`;
  }
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new Error(`PAYGATE_API_URL="${raw}" is not a valid URL; use e.g. http://localhost:8080`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`PAYGATE_API_URL must start with http:// or https:// (got "${raw}")`);
  }
  return v.replace(/\/+$/, "");
}

export async function callAPI(path: string, init: RequestInit = {}, token?: string): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(API_URL + path, { ...init, headers, cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(30_000) });
}

export async function readJSON(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
