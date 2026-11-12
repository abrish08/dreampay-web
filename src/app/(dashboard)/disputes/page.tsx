import type { Metadata } from "next";
import { DisputesScreen } from "@/features/disputes";

export const metadata: Metadata = { title: "Disputes" };

export default function Page() {
  return <DisputesScreen />;
}
