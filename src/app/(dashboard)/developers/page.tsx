import type { Metadata } from "next";
import { DevelopersScreen } from "@/features/developers";

export const metadata: Metadata = { title: "Developers" };

export default function Page() {
  return <DevelopersScreen />;
}
