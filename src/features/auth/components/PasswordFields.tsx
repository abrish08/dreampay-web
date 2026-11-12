"use client";
import { useId, useMemo } from "react";
import { Icon, PasswordInput } from "@/components/ui";
import { checkPassword, PASSWORD_MAX, PASSWORD_MIN, suggestPassword, type PasswordCheck } from "@/lib/password";
import s from "./PasswordFields.module.css";

/** Strength bar with a percentage and the checklist of rules (green tick when met). */
export function PasswordMeter({ check, id }: { check: PasswordCheck; id?: string }) {
  return (
    <div className={s.meter} id={id}>
      <div className={s.head}>
        <span>Strength: <strong className={s.label} data-tone={check.tone}>{check.label}</strong></span>
        <strong aria-hidden="true">{check.percent}%</strong>
      </div>
      <div className={s.track} role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={check.percent} aria-valuetext={`${check.percent}%, ${check.label}`}>
        <div className={s.fill} data-tone={check.tone} style={{ width: `${Math.max(check.percent, 3)}%` }} />
      </div>
      <ul className={s.rules} aria-label="Password requirements">
        {check.rules.map((r) => (
          <li key={r.id} className={s.rule} data-ok={r.ok || undefined}>
            <Icon name={r.ok ? "success" : "info"} size={14} />
            <span>{r.label}<span className="sr-only">{r.ok ? ": done" : ": not yet"}</span></span>
          </li>
        ))}
      </ul>
      {check.advice.length > 0 && (
        <ul className={s.advice} aria-label="Suggestions">
          {check.advice.map((a) => <li key={a}><Icon name="alert" size={14} /><span>{a} Allowed, but a different one is safer.</span></li>)}
        </ul>
      )}
    </div>
  );
}

/**
 * New password + confirmation. Reports through onValid whether both are
 * acceptable (every rule met and the two match).
 */
export function NewPasswordFields({ password, confirm, onPassword, onConfirm, personal = [], label = "Password", allowSuggest = true, showErrors = false }: {
  password: string; confirm: string; onPassword: (v: string) => void; onConfirm: (v: string) => void;
  personal?: string[]; label?: string; allowSuggest?: boolean;
  showErrors?: boolean; // after a submit attempt: say what is still wrong
}) {
  const meterId = useId();
  const check = useMemo(() => checkPassword(password, personal), [password, personal]);
  const matches = confirm.length > 0 && confirm === password;
  // Only complain once the confirmation can no longer become a match.
  const mismatch = confirm.length > 0 && !matches && (showErrors || confirm.length >= password.length || !password.startsWith(confirm));
  const weak = showErrors && password.length > 0 && !check.valid;

  const suggest = () => { const p = suggestPassword(); onPassword(p); onConfirm(p); };

  return (
    <>
      <PasswordInput label={label} autoComplete="new-password" required minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} value={password} valid={check.valid}
        error={weak ? "Meet every requirement in the list below." : undefined}
        onChange={(e) => onPassword(e.target.value)} aria-describedby={meterId} />
      {allowSuggest && !password && (
        <button type="button" className={s.suggest} onClick={suggest}><Icon name="lock" size={14} />Suggest a strong password</button>
      )}
      {password && <PasswordMeter check={check} id={meterId} />}
      <PasswordInput label={`Confirm ${label.toLowerCase()}`} autoComplete="new-password" required maxLength={PASSWORD_MAX} value={confirm}
        valid={matches && check.valid} error={mismatch ? "The passwords do not match." : undefined} onChange={(e) => onConfirm(e.target.value)} />
      {matches && <div className={s.match} role="status"><Icon name="success" size={14} />Passwords match</div>}
    </>
  );
}

export const passwordsOk = (password: string, confirm: string, personal: string[] = []) => checkPassword(password, personal).valid && password === confirm;
