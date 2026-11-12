"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, ErrorText, Input } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { personalWords } from "@/lib/password";
import { isEmail, isEthiopianPhone, isName } from "@/lib/validate";
import { authApi } from "../api";
import { startResendCooldown } from "../useResendCooldown";
import { AuthHeading } from "./AuthHeading";
import { NewPasswordFields, passwordsOk } from "./PasswordFields";

export function SignupForm() {
  const [f, setF] = useState({ business_name: "", name: "", email: "", phone: "" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const { busy, error, run } = useAction();

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const personal = useMemo(() => personalWords(f.email.split("@")[0], f.name, f.business_name), [f.email, f.name, f.business_name]);

  const ok = {
    business_name: isName(f.business_name),
    name: isName(f.name),
    email: isEmail(f.email),
    phone: f.phone.trim() === "" || isEthiopianPhone(f.phone),
    password: passwordsOk(password, confirm, personal),
  };
  const ready = Object.values(ok).every(Boolean);
  const err = (k: keyof typeof ok, msg: string) => (touched[k] && !ok[k] ? msg : undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ business_name: true, name: true, email: true, phone: true });
    setAttempted(true);
    if (!ready) return;
    run(async () => {
      const email = f.email.trim().toLowerCase();
      await authApi.signup({ ...f, email, business_name: f.business_name.trim(), name: f.name.trim(), phone: f.phone.trim(), password });
      startResendCooldown(email); // a code was just sent
      setPassword(""); setConfirm("");
      window.location.assign(`/verify?email=${encodeURIComponent(email)}`);
    });
  };

  return (
    <form className="stack" onSubmit={submit}>
      <AuthHeading title="Create your account" subtitle="Start in test mode right away. Live payments open after business verification." />
      <Input label="Business name" required autoComplete="organization" maxLength={100} value={f.business_name} onChange={set("business_name")} onBlur={blur("business_name")}
        valid={ok.business_name} error={err("business_name", "Enter your business name.")} />
      <Input label="Your full name" required autoComplete="name" maxLength={100} value={f.name} onChange={set("name")} onBlur={blur("name")}
        valid={ok.name} error={err("name", "Enter your name.")} />
      <Input label="Work email" type="email" required autoComplete="username" maxLength={254} value={f.email} onChange={set("email")} onBlur={blur("email")}
        valid={ok.email} error={err("email", "Enter a valid email, e.g. name@business.com.")} />
      <Input label="Phone" type="tel" optional autoComplete="tel" placeholder="09… or +251 9…" value={f.phone} onChange={set("phone")} onBlur={blur("phone")}
        valid={f.phone.trim() !== "" && ok.phone} error={err("phone", "Use an Ethiopian mobile number, e.g. 0911 234 567.")} />
      <NewPasswordFields password={password} confirm={confirm} onPassword={setPassword} onConfirm={setConfirm} personal={personal} showErrors={attempted} />
      <ErrorText error={error} />
      <Button type="submit" variant="primary" block loading={busy}>Create account</Button>
      <p className="small subtle" style={{ marginTop: -8 }}>Fields marked <span style={{ color: "var(--color-danger)" }}>*</span> are required.</p>
      <p className="small muted">Already have an account? <Link href="/login">Sign in</Link></p>
    </form>
  );
}
