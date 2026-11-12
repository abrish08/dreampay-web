"use client";
import Link from "next/link";
import { useState } from "react";
import { Alert, Button, ErrorText, Input } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { authApi } from "../api";
import { AuthHeading } from "./AuthHeading";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { busy, error, run } = useAction();
  const submit = (e: React.FormEvent) => { e.preventDefault(); run(async () => { await authApi.forgot(email); setSent(true); }); };

  return (
    <div className="stack">
      <AuthHeading title="Reset your password" subtitle="Enter your account email and we will send you a reset link." />
      {sent ? (
        <Alert tone="success" title="Check your email">If an account exists for {email}, a reset link is on its way. It works for a short time.</Alert>
      ) : (
        <form className="stack" onSubmit={submit}>
          <Input label="Email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <ErrorText error={error} />
          <Button type="submit" variant="primary" block loading={busy}>Send reset link</Button>
        </form>
      )}
      <p className="small"><Link href="/login">Back to sign in</Link></p>
    </div>
  );
}
