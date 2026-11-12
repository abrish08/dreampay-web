import type { Metadata } from "next";
import { KycScreen } from "@/features/kyc";

export const metadata: Metadata = { title: "Business verification" };

export default function Page() {
  return <KycScreen />;
}
