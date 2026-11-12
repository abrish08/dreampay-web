"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Button, ErrorText, Input, PasswordInput } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { ApiError, safeNext } from "@/lib/api/client";
import { authApi } from "../api";
import { AuthHeading } from "./AuthHeading";

export function LoginForm() {
  const params = useSearchParams();
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const { busy, error, setError, run } = useAction();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      try {
        if (step === "password") {
          const r = await authApi.login(email, password);
          setPassword("");
          if (r.mfa_required) { setStep("mfa"); return; }
        } else {
          await authApi.mfa(code.trim());
        }
        window.location.assign(safeNext(params.get("next")));
      } catch (err) {
        if (err instanceof ApiError && err.code === "verification_required") {
          window.location.assign(`/verify?email=${encodeURIComponent(email)}`);
          return;
        }
        if (err instanceof ApiError && err.code === "mfa_expired") { setStep("password"); setCode(""); }
        throw err;
      }
    });
  };

  if (step === "mfa") {
    return (
      <form className="stack" onSubmit={submit}>
        <AuthHeading title="Two-factor authentication" subtitle="Open Microsoft Authenticator (or your authenticator app) and enter the 6-digit code for Paygate. A recovery code also works." />
        <Input label="Authentication code" otp autoFocus inputMode="numeric" autoComplete="one-time-code" required maxLength={20} value={code} onChange={(e) => setCode(e.target.value)} />
        <ErrorText error={error} />
        <Button type="submit" variant="primary" block loading={busy}>Verify</Button>
        <Button variant="ghost" onClick={() => { setStep("password"); setCode(""); setError(""); }}>Use a different account</Button>
      </form>
    );
  }
  return (
    <form className="stack" onSubmit={submit}>
      <AuthHeading title="Sign in" subtitle="Welcome back. Sign in to your merchant dashboard." />
      {params.get("reason") === "expired" && !error && (
        <Alert tone="info" title="You were signed out">Your session ended. Sign in again to continue where you left off.</Alert>
      )}
      <Input label="Email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
      <PasswordInput label="Password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="cluster-between small"><span /><Link href="/forgot">Forgot password?</Link></div>
      <ErrorText error={error} />
      <Button type="submit" variant="primary" block loading={busy}>Sign in</Button>
      <p className="small muted">New to Paygate? <Link href="/signup">Create an account</Link></p>
    </form>
  );
}
