"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { isVerified, useSession } from "./SessionProvider";

// Which money the dashboard shows. Until the business is verified (KYC
// approved) only test mode exists. Once approved the dashboard switches to
// live by itself; a verified business may still look at test data.
export type Environment = "test" | "live";
const KEY = "pg_env";

type EnvState = { env: Environment; setEnv: (e: Environment) => void; liveAllowed: boolean };
const Ctx = createContext<EnvState>({ env: "test", setEnv: () => {}, liveAllowed: false });

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const { merchant } = useSession();
  const toast = useToast();
  const liveAllowed = isVerified(merchant?.kyc_status);
  const [choice, setChoice] = useState<Environment | null>(null);
  const wasAllowed = useRef<boolean | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "live" || v === "test") setChoice(v);
    } catch {}
  }, []);

  useEffect(() => {
    if (!merchant) return;
    if (!liveAllowed) {
      // Not verified: test only, and forget any earlier choice so the
      // switch to live happens by itself on approval.
      setChoice(null);
      try { localStorage.removeItem(KEY); } catch {}
    } else if (wasAllowed.current === false) {
      setChoice("live");
      try { localStorage.setItem(KEY, "live"); } catch {}
      toast("Your business is verified: you are now in live mode.");
    }
    wasAllowed.current = liveAllowed;
  }, [merchant, liveAllowed, toast]);

  const env: Environment = liveAllowed ? choice ?? "live" : "test";
  const setEnv = (e: Environment) => {
    if (e === "live" && !liveAllowed) return; // live needs verification
    setChoice(e);
    try { localStorage.setItem(KEY, e); } catch {}
  };
  return <Ctx.Provider value={{ env, setEnv, liveAllowed }}>{children}</Ctx.Provider>;
}

export const useEnv = () => useContext(Ctx);
