"use client";
import { useState } from "react";
import { Alert, Button, Card, CopyButton, ErrorText, Input } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useResource } from "@/hooks/useResource";
import { dateOnly } from "@/lib/format";
import { securityApi, type MfaSetup } from "../api";
import s from "./MfaCard.module.css";

export function MfaCard({ required }: { required: boolean }) {
  const status = useResource(() => securityApi.status(), []);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const { busy, error, run } = useAction();

  const start = () => run(async () => setSetup(await securityApi.setup()));
  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await run(() => securityApi.confirm(code.trim()));
    if (r) { setCodes(r.recovery_codes); setSetup(null); setCode(""); status.reload(); }
    else setCode(""); // wrong code: stay on this step and try the next one from the app
  };
  const signInAgain = async () => { await securityApi.signOut().catch(() => {}); window.location.assign("/login"); };

  const st = status.data;
  return (
    <Card title="Two-factor authentication" description="An authenticator app protects your money even if your password leaks.">
      <div className="stack">
        {required && !st?.enabled && !setup && codes.length === 0 && (
          <Alert tone="warning" title="Set up your authenticator to continue">Your dashboard requires two-factor authentication.</Alert>
        )}
        {codes.length > 0 && (
          <Alert tone="success" title="Two-factor authentication is on">
            <div className="stack-sm">
              <span>Save these recovery codes in a password manager or print them. Each works once if you lose your phone. They are not shown again.</span>
              <div className={s.codes}>{codes.map((c) => <code key={c}>{c}</code>)}</div>
              <div className="cluster"><CopyButton value={codes.join("\n")} label="Copy codes" /><Button size="sm" variant="primary" onClick={signInAgain}>Sign in again with a code</Button></div>
            </div>
          </Alert>
        )}
        {st?.enabled && codes.length === 0 && (
          <Alert tone="success" title="On">Since {dateOnly(st.enabled_at)}. {st.recovery_codes_left} recovery codes left.</Alert>
        )}
        {st && !st.enabled && !setup && codes.length === 0 && (
          <div><Button variant="primary" icon="lock" onClick={start} loading={busy}>Set up authenticator app</Button></div>
        )}
        {setup && (
          <form onSubmit={confirm} className={s.setup}>
            <div className={s.qr}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr_code} alt="QR code to add Paygate to your authenticator app" width={184} height={184} />
            </div>
            <ol className={s.steps}>
              <li>Open <strong>Microsoft Authenticator</strong> (or Google Authenticator) and tap <strong>+</strong> → <strong>Other account</strong>.</li>
              <li>Scan the QR code. The account appears as <strong>{setup.issuer}</strong>.</li>
              <li>
                Can&apos;t scan? Enter this key:
                <div className="cluster" style={{ marginTop: 6 }}><code className={s.key}>{setup.secret.match(/.{1,4}/g)?.join(" ")}</code><CopyButton value={setup.secret} /></div>
              </li>
              <li>
                Enter the 6-digit code from the app:
                <div className="cluster" style={{ marginTop: 6, alignItems: "flex-end" }}>
                  <Input label={<span className="sr-only">Code</span>} otp inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
                  <Button type="submit" variant="primary" loading={busy}>Turn on</Button>
                </div>
              </li>
            </ol>
          </form>
        )}
        <ErrorText error={error || status.error} />
      </div>
    </Card>
  );
}
