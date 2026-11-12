"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import s from "./Menu.module.css";

const CloseCtx = createContext<() => void>(() => {});

type TriggerProps = { ref: React.Ref<HTMLButtonElement>; onClick: () => void; "aria-haspopup": "menu" | "dialog"; "aria-expanded": boolean; "aria-controls": string };

/**
 * A popover anchored to its trigger. Fixed positioning, so it is never cut
 * off by a scrolling table. Closes on outside click, Escape, scroll, resize.
 */
export function Menu({ trigger, children, align = "end", width, kind = "menu", onOpen }: {
  trigger: (p: TriggerProps) => React.ReactNode; children: React.ReactNode; align?: "start" | "end"; width?: number; kind?: "menu" | "dialog"; onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({});
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => { setOpen(false); btn.current?.focus(); }, []);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const h = panel.current?.offsetHeight ?? 240;
    const below = r.bottom + 6 + h < window.innerHeight || r.top < h + 6;
    const top = below ? r.bottom + 6 : r.top - 6 - h;
    setPos(align === "end" ? { top, right: Math.max(8, window.innerWidth - r.right), width } : { top, left: Math.max(8, r.left), width });
  }, [open, align, width]);

  useEffect(() => {
    if (!open) return;
    const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("[data-menu-item]") ?? []);
    if (kind === "menu") items()[0]?.focus();
    const away = (e: MouseEvent) => { if (!panel.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (kind === "menu" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const list = items(); const i = list.indexOf(document.activeElement as HTMLElement);
        list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length]?.focus();
      }
    };
    const shut = () => setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", shut);
    window.addEventListener("scroll", shut, true);
    return () => {
      document.removeEventListener("mousedown", away); document.removeEventListener("keydown", key);
      window.removeEventListener("resize", shut); window.removeEventListener("scroll", shut, true);
    };
  }, [open, close, kind]);

  return (
    <>
      {trigger({ ref: btn, onClick: () => { setOpen((v) => { if (!v) onOpen?.(); return !v; }); }, "aria-haspopup": kind, "aria-expanded": open, "aria-controls": id })}
      {open && (
        <div ref={panel} id={id} className={s.panel} style={pos} role={kind} onScroll={(e) => e.stopPropagation()}>
          <CloseCtx.Provider value={close}>{children}</CloseCtx.Provider>
        </div>
      )}
    </>
  );
}

type ItemProps = { icon?: IconName; danger?: boolean; checked?: boolean; children: React.ReactNode };

export function MenuItem({ icon, danger, checked, children, onSelect, href }: ItemProps & { onSelect?: () => void; href?: string }) {
  const close = useContext(CloseCtx);
  const body = <>{icon && <Icon name={icon} size={16} />}<span>{children}</span>{checked && <Icon name="check" size={16} className={s.check} />}</>;
  if (href) return <Link href={href} className={cx(s.item, danger && s.danger)} role="menuitem" data-menu-item onClick={() => close()}>{body}</Link>;
  return (
    <button type="button" className={cx(s.item, danger && s.danger)} role={checked === undefined ? "menuitem" : "menuitemradio"} aria-checked={checked}
      data-menu-item onClick={() => { close(); onSelect?.(); }}>{body}</button>
  );
}

export const MenuLabel = ({ children }: { children: React.ReactNode }) => <div className={s.label}>{children}</div>;
export const MenuSeparator = () => <div className={s.sep} role="separator" />;
