"use client";
import { useMemo, useState } from "react";
import { Button, Card, ErrorText, Input, PasswordInput, useToast } from "@/components/ui";
import { NewPasswordFields, passwordsOk } from "@/features/auth";
import { useAction } from "@/hooks/useAction";
import { personalWords } from "@/lib/password";
import { useSession } from "@/providers/SessionProvider";
import { securityApi } from "../api";

export function PasswordCard() {
  const { me } = useSession();
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [code, setCode] = useState("");
  const { busy, error, setError, run } = useAction();
  const toast = useToast();
  const personal = useMemo(() => personalWords(me?.email?.split("@")[0], me?.name), [me]);
  const ready = !!current && passwordsOk(pw, pw2, personal) && code.length === 6;
  const [attempted, setAttempted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!ready) return;
    if (pw === current) { setError("Choose a password different from the current one."); return; }
    const ok = await run(() => securityApi.changePassword({ current_password: current, new_password: pw, totp_code: code }));
    if (ok) { setCurrent(""); setPw(""); setPw2(""); setCode(""); toast("Password changed. Other sessions were signed out."); }
  };

  return (
    <Card title="Password" description="Changing it signs out your other sessions.">
      <form className="stack" onSubmit={submit} style={{ maxWidth: 520 }}>
        <PasswordInput label="Current password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        <NewPasswordFields password={pw} confirm={pw2} onPassword={setPw} onConfirm={setPw2} personal={personal} label="New password" showErrors={attempted} />
        <Input label="Authenticator code" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} required value={code} valid={code.length === 6}
          error={attempted && code.length > 0 && code.length !== 6 ? "Enter the 6-digit code from the app." : undefined}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
        <ErrorText error={error} />
        <div><Button type="submit" variant="primary" loading={busy}>Change password</Button></div>
      </form>
    </Card>
  );
}
