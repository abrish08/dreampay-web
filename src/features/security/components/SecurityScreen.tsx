"use client";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { MfaCard } from "./MfaCard";
import { PasswordCard } from "./PasswordCard";

export function SecurityScreen() {
  const required = useSearchParams().get("setup") === "1";
  return (
    <>
      <PageHeader title="Security" description="Protect your account and your money." />
      <div className="stack">
        <MfaCard required={required} />
        <PasswordCard />
      </div>
    </>
  );
}
