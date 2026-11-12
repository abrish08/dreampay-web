import { Suspense } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout><Suspense>{children}</Suspense></AuthLayout>;
}
