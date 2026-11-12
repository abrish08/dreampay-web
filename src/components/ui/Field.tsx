"use client";
import { useId, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";
import s from "./Field.module.css";

/**
 * Form fields. A field with `required` shows a red * after its label. When
 * a required field is left empty or has the wrong format (email, minimum
 * length ...), it gets a red outline and a message: when the user leaves it,
 * and on every field at once when the form is submitted. The message goes
 * away as soon as the value is fixed. `error` (from the form) always wins.
 */
type FieldProps = {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  valid?: boolean;
  /** Show the red * without browser validation (e.g. "needed before submitting"). */
  mark?: boolean;
};

function Field({ id, label, hint, error, optional, required, className, children }: FieldProps & { id: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={id} className={s.label}>
        {label}
        {required && <span className={s.req} aria-hidden="true"> *</span>}
        {optional && <span className={s.optional}> (optional)</span>}
      </label>
      {children}
      {error ? (
        <span id={`${id}-err`} className={s.error} role="alert"><Icon name="alert" size={13} />{error}</span>
      ) : hint && <span id={`${id}-hint`} className={s.hint}>{hint}</span>}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: React.ReactNode, extra?: string) =>
  [error ? `${id}-err` : hint ? `${id}-hint` : undefined, extra].filter(Boolean).join(" ") || undefined;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** A short, plain message for the browser's validity state. */
function messageFor(el: Control): string {
  const v = el.validity;
  if (v.valid) return "";
  if (v.valueMissing) {
    if (el instanceof HTMLSelectElement) return "Choose an option.";
    if (el.type === "file") return "Choose a file.";
    return "This field is required.";
  }
  if (v.typeMismatch && el.type === "email") return "Enter a valid email, e.g. name@business.com.";
  if (v.typeMismatch && el.type === "url") return "Enter a full web address, starting with https://.";
  if (v.tooShort && "minLength" in el) return `Use at least ${el.minLength} characters.`;
  if (v.tooLong && "maxLength" in el) return `Use at most ${el.maxLength} characters.`;
  if (v.rangeUnderflow || v.rangeOverflow) return "This value is out of range.";
  if (v.patternMismatch) return "Check the format.";
  return el.validationMessage;
}

type Handlers<E extends Control> = {
  onBlur?: React.FocusEventHandler<E>;
  onChange?: React.ChangeEventHandler<E>;
  onInvalid?: React.FormEventHandler<E>;
};

/** Shows the field's own validation once the user left it or tried to submit. */
function useValidation<E extends Control>(h: Handlers<E>) {
  const [shown, setShown] = useState(false);
  const [message, setMessage] = useState("");
  return {
    message: shown ? message : "",
    handlers: {
      onBlur: (e: React.FocusEvent<E>) => {
        h.onBlur?.(e);
        setShown(true);
        setMessage(messageFor(e.currentTarget));
      },
      onChange: (e: React.ChangeEvent<E>) => {
        h.onChange?.(e);
        if (shown) setMessage(messageFor(e.currentTarget));
      },
      onInvalid: (e: React.FormEvent<E>) => {
        h.onInvalid?.(e);
        e.preventDefault(); // our message instead of the browser's bubble
        setShown(true);
        setMessage(messageFor(e.currentTarget));
        const first = e.currentTarget.form?.querySelector<HTMLElement>(":invalid");
        if (first === e.currentTarget) first.focus();
      },
    },
  };
}

const ValidMark = () => <span className={s.validIcon} aria-hidden="true"><Icon name="success" size={17} /></span>;

type InputProps = FieldProps & Omit<React.ComponentPropsWithRef<"input">, "className"> & { otp?: boolean };

export function Input({ label, hint, error, optional, className, otp, id, valid, mark, onBlur, onChange, onInvalid, ...rest }: InputProps) {
  const auto = useId();
  const fid = id ?? auto;
  const v = useValidation<HTMLInputElement>({ onBlur, onChange, onInvalid });
  const shownError = error || v.message;
  const ok = !!valid && !shownError;
  return (
    <Field id={fid} label={label} hint={hint} error={shownError} optional={optional} required={rest.required || mark} className={className}>
      <div className={cx(s.wrap, ok && s.withIcon)}>
        <input id={fid} className={cx(s.control, otp && s.otp)} data-valid={ok || undefined} aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy(fid, shownError, hint)} {...rest} {...v.handlers} />
        {ok && <ValidMark />}
      </div>
    </Field>
  );
}

export function PasswordInput(props: Omit<InputProps, "type">) {
  const [show, setShow] = useState(false);
  const auto = useId();
  const fid = props.id ?? auto;
  const { label, hint, error, optional, className, valid, mark, otp: _otp, onBlur, onChange, onInvalid, ...rest } = props;
  const v = useValidation<HTMLInputElement>({ onBlur, onChange, onInvalid });
  const shownError = error || v.message;
  const ok = !!valid && !shownError;
  return (
    <Field id={fid} label={label} hint={hint} error={shownError} optional={optional} required={rest.required || mark} className={className}>
      <div className={cx(s.withAction, ok && s.withIcon)}>
        <input {...rest} {...v.handlers} id={fid} type={show ? "text" : "password"} className={s.control} data-valid={ok || undefined}
          aria-invalid={shownError ? true : undefined} aria-describedby={describedBy(fid, shownError, hint, rest["aria-describedby"])} />
        {ok && <ValidMark />}
        <button type="button" className={s.action} onClick={() => setShow((x) => !x)} aria-label={show ? "Hide password" : "Show password"}>
          <Icon name={show ? "eyeOff" : "eye"} size={17} />
        </button>
      </div>
    </Field>
  );
}

type SelectProps = FieldProps & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  options: readonly (string | { value: string; label: string; disabled?: boolean })[];
  placeholder?: string;
};

export function Select({ label, hint, error, optional, className, options, placeholder, id, mark, valid: _valid, onBlur, onChange, onInvalid, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  const v = useValidation<HTMLSelectElement>({ onBlur, onChange, onInvalid });
  const shownError = error || v.message;
  return (
    <Field id={fid} label={label} hint={hint} error={shownError} optional={optional} required={rest.required || mark} className={className}>
      <select id={fid} className={s.control} aria-invalid={shownError ? true : undefined} aria-describedby={describedBy(fid, shownError, hint)} {...rest} {...v.handlers}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
      </select>
    </Field>
  );
}

type TextareaProps = FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function Textarea({ label, hint, error, optional, className, id, mark, valid: _valid, onBlur, onChange, onInvalid, ...rest }: TextareaProps) {
  const auto = useId();
  const fid = id ?? auto;
  const v = useValidation<HTMLTextAreaElement>({ onBlur, onChange, onInvalid });
  const shownError = error || v.message;
  return (
    <Field id={fid} label={label} hint={hint} error={shownError} optional={optional} required={rest.required || mark} className={className}>
      <textarea id={fid} className={s.control} aria-invalid={shownError ? true : undefined} aria-describedby={describedBy(fid, shownError, hint)} {...rest} {...v.handlers} />
    </Field>
  );
}

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & { label: React.ReactNode; hint?: React.ReactNode; className?: string };

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx(s.check, className)}>
      <input type="checkbox" {...rest} />
      <span>{label}{rest.required && <span className={s.req} aria-hidden="true"> *</span>}{hint && <small>{hint}</small>}</span>
    </label>
  );
}
