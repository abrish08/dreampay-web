"use client";
import { useId, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";
import s from "./Field.module.css";

type FieldProps = { label: React.ReactNode; hint?: React.ReactNode; error?: string; optional?: boolean; className?: string; valid?: boolean };

function Field({ id, label, hint, error, optional, className, children }: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={id} className={s.label}>{label}{optional && <span className={s.optional}> (optional)</span>}</label>
      {children}
      {error ? <span id={`${id}-err`} className={s.error} role="alert">{error}</span> : hint && <span id={`${id}-hint`} className={s.hint}>{hint}</span>}
    </div>
  );
}

const describedBy = (id: string, f: FieldProps) => (f.error ? `${id}-err` : f.hint ? `${id}-hint` : undefined);

type InputProps = FieldProps & Omit<React.ComponentPropsWithRef<"input">, "className"> & { otp?: boolean };

const ValidMark = () => <span className={s.validIcon} aria-hidden="true"><Icon name="success" size={17} /></span>;

export function Input({ label, hint, error, optional, className, otp, id, valid, ...rest }: InputProps) {
  const auto = useId();
  const fid = id ?? auto;
  const ok = !!valid && !error;
  return (
    <Field id={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className={cx(s.wrap, ok && s.withIcon)}>
        <input id={fid} className={cx(s.control, otp && s.otp)} data-valid={ok || undefined} aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fid, { label, hint, error })} {...rest} />
        {ok && <ValidMark />}
      </div>
    </Field>
  );
}

export function PasswordInput(props: Omit<InputProps, "type">) {
  const [show, setShow] = useState(false);
  const auto = useId();
  const fid = props.id ?? auto;
  const { label, hint, error, optional, className, valid, otp: _otp, ...rest } = props;
  const ok = !!valid && !error;
  return (
    <Field id={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className={cx(s.withAction, ok && s.withIcon)}>
        <input {...rest} id={fid} type={show ? "text" : "password"} className={s.control} data-valid={ok || undefined} aria-invalid={error ? true : undefined}
          aria-describedby={[describedBy(fid, props), rest["aria-describedby"]].filter(Boolean).join(" ") || undefined} />
        {ok && <ValidMark />}
        <button type="button" className={s.action} onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
          <Icon name={show ? "eyeOff" : "eye"} size={17} />
        </button>
      </div>
    </Field>
  );
}

type SelectProps = FieldProps & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
};

export function Select({ label, hint, error, optional, className, options, placeholder, id, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Field id={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select id={fid} className={s.control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, { label, hint, error })} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

type TextareaProps = FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function Textarea({ label, hint, error, optional, className, id, ...rest }: TextareaProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Field id={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea id={fid} className={s.control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, { label, hint, error })} {...rest} />
    </Field>
  );
}

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & { label: React.ReactNode; hint?: React.ReactNode; className?: string };

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx(s.check, className)}>
      <input type="checkbox" {...rest} />
      <span>{label}{hint && <small>{hint}</small>}</span>
    </label>
  );
}
