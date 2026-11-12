import type { Metadata } from "next";
import { LinksScreen } from "@/features/links";

export const metadata: Metadata = { title: "Payment links" };

export default function Page() {
  return <LinksScreen />;
}
