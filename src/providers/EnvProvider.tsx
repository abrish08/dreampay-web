"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Test or live data. Merchants work in test mode until KYC is approved.
export type Environment = "test" | "live";
const KEY = "pg_env";
const Ctx = createContext<{ env: Environment; setEnv: (e: Environment) => void }>({ env: "test", setEnv: () => {} });

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const [env, setState] = useState<Environment>("test");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "live" || v === "test") setState(v);
    } catch {}
  }, []);
  const setEnv = (e: Environment) => {
    setState(e);
    try { localStorage.setItem(KEY, e); } catch {}
  };
  return <Ctx.Provider value={{ env, setEnv }}>{children}</Ctx.Provider>;
}

export const useEnv = () => useContext(Ctx);
