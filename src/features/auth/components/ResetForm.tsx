"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Button, ErrorText } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { authApi } from "../api";
import { AuthHeading } from "./AuthHeading";
import { NewPasswordFields, passwordsOk } from "./PasswordFields";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();
  const ready = passwordsOk(pw, pw2);
  const [attempted, setAttempted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (ready) run(async () => { await authApi.reset(token, pw); setPw(""); setPw2(""); setDone(true); });
  };

  if (!token) return <Alert tone="danger" title="This link is not complete">Open the link from the email again, or <Link href="/forgot">request a new one</Link>.</Alert>;
  return (
    <div className="stack">
      <AuthHeading title="Choose a new password" subtitle="Use a password you have not used before." />
      {done ? (
        <Alert tone="success" title="Password changed" action={<Link href="/login">Sign in</Link>}>Other sessions were signed out.</Alert>
      ) : (
        <form className="stack" onSubmit={submit}>
          <NewPasswordFields password={pw} confirm={pw2} onPassword={setPw} onConfirm={setPw2} label="New password" showErrors={attempted} />
          <ErrorText error={error} />
          <Button type="submit" variant="primary" block loading={busy}>Change password</Button>
        </form>
      )}
    </div>
  );
}
