import type { Metadata } from "next";
import { ResetForm } from "@/features/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default function Page() {
  return <ResetForm />;
}
