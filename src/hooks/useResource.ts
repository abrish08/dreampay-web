"use client";
import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";

/** Loads data for a screen; reloads when deps change or reload() is called. */
export function useResource<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    load()
      .then((d) => live && setData(d))
      .catch((e) => live && setError(errorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, error, loading, reload, setData };
}
