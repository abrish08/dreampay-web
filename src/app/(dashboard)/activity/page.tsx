import type { Metadata } from "next";
import { ActivityScreen } from "@/features/activity";

export const metadata: Metadata = { title: "Activity log" };

export default function Page() {
  return <ActivityScreen />;
}
