"use client";
import { useState } from "react";
import { errorMessage } from "@/lib/api/client";

/**
 * Runs a button/form action with a busy flag and a readable error.
 * run() resolves to the action's result (true when it returned nothing,
 * e.g. a 204 reply) or to undefined when it failed.
 */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    setError("");
    try {
      const value = await fn();
      return value === undefined ? (true as T) : value;
    } catch (e) {
      setError(errorMessage(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, setError, run };
}
