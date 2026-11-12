"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Alert, Button, ErrorText, Icon, Input } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { ApiError } from "@/lib/api/client";
import { isEmail } from "@/lib/validate";
import { authApi } from "../api";
import { mmss, useResendCooldown } from "../useResendCooldown";
import { AuthHeading } from "./AuthHeading";

export function VerifyForm() {
  const email = useSearchParams().get("email") ?? "";
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const { busy, error, setError, run } = useAction();
  const { left, start } = useResendCooldown(email);
  const submitting = useRef(false);

  const verify = (value: string) => {
    if (submitting.current || value.length !== 6) return;
    submitting.current = true;
    run(async () => {
      try {
        await authApi.verify(email, value);
        window.location.assign("/security?setup=1");
      } catch (e) {
        setCode("");
        throw e;
      } finally {
        submitting.current = false;
      }
    });
  };

  const resend = () => run(async () => {
    try {
      await authApi.resendCode(email);
      start(); setSent(true); setCode("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) { start(); throw new Error("Too many requests. Wait for the timer, then try again."); }
      throw e;
    }
  });

  if (!isEmail(email)) {
    return <Alert tone="danger" title="This link is not complete">Sign up again, or <Link href="/login">sign in</Link> to get a new code.</Alert>;
  }

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); verify(code); }}>
      <AuthHeading title="Check your email" subtitle={<>We sent a 6-digit code to <strong>{email}</strong>. It is valid for 15 minutes.</>} />
      <Input label="Verification code" otp autoFocus inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={6} pattern="\d{6}" value={code}
        valid={code.length === 6 && !error}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setCode(v); setError(""); if (v.length === 6) verify(v); }} />
      <ErrorText error={error} />
      {sent && !error && <Alert tone="success">A new code is on its way. Check your inbox and spam folder.</Alert>}
      <Button type="submit" variant="primary" block loading={busy}>Verify email</Button>
      <div className="cluster-between small">
        <span className="muted">Didn&apos;t get the code?</span>
        {left > 0 ? (
          <span className="cluster subtle" aria-live="polite"><Icon name="refresh" size={14} />Send a new code in <strong className="num">{mmss(left)}</strong></span>
        ) : (
          <Button size="sm" variant="ghost" icon="refresh" onClick={resend} disabled={busy}>Send a new code</Button>
        )}
      </div>
    </form>
  );
}
