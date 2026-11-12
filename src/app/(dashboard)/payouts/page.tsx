import type { Metadata } from "next";
import { PayoutsScreen } from "@/features/payouts";

export const metadata: Metadata = { title: "Payouts" };

export default function Page() {
  return <PayoutsScreen />;
}
