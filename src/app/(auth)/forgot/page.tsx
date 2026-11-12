import type { Metadata } from "next";
import { ForgotForm } from "@/features/auth";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return <ForgotForm />;
}
