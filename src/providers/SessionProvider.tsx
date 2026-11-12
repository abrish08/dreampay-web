"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export type Me = { id: string; name: string; email: string; merchant_id?: string };
export type Merchant = { id: string; name: string; kyc_status: string };
type Session = { me: Me | null; merchant: Merchant | null; reload: () => void };

const Ctx = createContext<Session>({ me: null, merchant: null, reload: () => {} });

/** The signed-in user and their business, loaded once for the whole dashboard. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const reload = useCallback(() => {
    api<Me>("auth/me").then(setMe).catch(() => {});
    api<Merchant>("v1/merchant").then(setMerchant).catch(() => {});
  }, []);
  useEffect(reload, [reload]);
  // Pick up a KYC approval without signing out: check again every minute
  // and whenever the tab comes back into view.
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") api<Merchant>("v1/merchant").then(setMerchant).catch(() => {}); };
    const t = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return <Ctx.Provider value={{ me, merchant, reload }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
export const isVerified = (kyc?: string) => kyc === "approved" || kyc === "waived";
