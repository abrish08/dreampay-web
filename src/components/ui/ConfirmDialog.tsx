"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import s from "./ConfirmDialog.module.css";

type Options = { title: string; body?: React.ReactNode; confirmLabel?: string; danger?: boolean };
const Ctx = createContext<(o: Options) => Promise<boolean>>(async () => false);

/** Accessible confirmation dialog (native <dialog>): await confirm({...}). */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [opts, setOpts] = useState<Options | null>(null);

  const confirm = useCallback((o: Options) => new Promise<boolean>((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setOpts(o);
  }), []);

  useEffect(() => {
    if (opts && ref.current && !ref.current.open) ref.current.showModal();
  }, [opts]);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    ref.current?.close();
    setOpts(null);
  };

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <dialog ref={ref} className={s.dialog} aria-labelledby="confirm-title" onCancel={(e) => { e.preventDefault(); close(false); }}>
        {opts && (
          <form className={s.form} onSubmit={(e) => { e.preventDefault(); close(true); }}>
            <h2 id="confirm-title">{opts.title}</h2>
            {opts.body && <div className={s.body}>{opts.body}</div>}
            <div className={s.actions}>
              <Button onClick={() => close(false)}>Cancel</Button>
              <Button type="submit" variant={opts.danger ? "dangerSolid" : "primary"} autoFocus>{opts.confirmLabel ?? "Confirm"}</Button>
            </div>
          </form>
        )}
      </dialog>
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx);
