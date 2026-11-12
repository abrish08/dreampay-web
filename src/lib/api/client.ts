// Browser-side API access. Every call goes to this app's /api/proxy route;
// the session cookies travel automatically and tokens never reach JavaScript.

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export type Page<T> = { data: T[]; has_more?: boolean; next_cursor?: string };

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; form?: FormData; idempotencyKey?: string; signal?: AbortSignal };

const CSRF_HEADER = { "X-Requested-With": "paygate-web" };

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { ...CSRF_HEADER };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
  const res = await fetch(`/api/proxy/${path.replace(/^\/+/, "")}`, {
    method: opts.method ?? "GET", headers, body, cache: "no-store", signal: opts.signal,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string } }).error ?? {};
    // Only a real end of session signs the user out; other 401s (a wrong
    // authenticator code, a wrong current password) are shown on the page.
    if (res.status === 401 && e.code === "session_expired") {
      window.location.assign(`/login?reason=expired&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    } else if (e.code === "mfa_required" && !window.location.pathname.startsWith("/security")) {
      window.location.assign("/security?setup=1");
    }
    throw new ApiError(res.status, e.code ?? "error", e.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

/** Calls the sign-in routes (/api/auth/...). */
export async function authPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { ...CSRF_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string } }).error ?? {};
    throw new ApiError(res.status, e.code ?? "error", e.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/** A key that makes a money action safe to retry: the API runs it once. */
export function newIdempotencyKey(): string {
  // randomUUID is missing on plain-http pages; getRandomValues works everywhere.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** Only same-site paths are allowed after sign-in (no open redirects). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

/** Encodes one path segment (ids from the URL). */
export const seg = (s: string) => encodeURIComponent(s);
