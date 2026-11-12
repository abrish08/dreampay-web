import "server-only";

// Calls from this server to the Go API.
export const API_URL = (process.env.PAYGATE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

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
