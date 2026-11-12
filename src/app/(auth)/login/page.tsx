import type { Metadata } from "next";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <LoginForm />;
}
