"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { navigation } from "./nav";
import s from "./CommandPalette.module.css";

type Command = { id: string; label: string; hint?: string; icon: IconName; href: string; group: string };

const ACTIONS: Command[] = [
  { id: "a-link", label: "Create a payment link", icon: "plus", href: "/links", group: "Actions" },
  { id: "a-payout", label: "Request a payout", icon: "bank", href: "/payouts", group: "Actions" },
  { id: "a-key", label: "Create an API key", icon: "code", href: "/developers", group: "Actions" },
  { id: "a-report", label: "Download a report", icon: "download", href: "/reports", group: "Actions" },
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ⌘K / Ctrl+K: jump to a page, an action, a payment id or a reference. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) { setQ(""); setIndex(0); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pages: Command[] = navigation.flatMap((g) => g.items.map((it) => ({ id: it.href, label: it.label, icon: it.icon, href: it.href, group: "Pages", hint: it.keywords })));
    const all = [...pages, ...ACTIONS].filter((c) => !term || c.label.toLowerCase().includes(term) || c.hint?.includes(term));
    const found: Command[] = [];
    if (UUID.test(q.trim())) found.push({ id: "pay-id", label: `Open payment ${q.trim().slice(0, 8)}…`, icon: "card", href: `/payments/${q.trim()}`, group: "Payments" });
    else if (term.length >= 2) found.push({ id: "pay-ref", label: `Find payments with reference “${q.trim()}”`, icon: "search", href: `/payments?reference=${encodeURIComponent(q.trim())}`, group: "Payments" });
    return [...found, ...all];
  }, [q]);

  const go = (c?: Command) => { if (!c) return; onClose(); router.push(c.href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); go(results[index]); }
  };

  let lastGroup = "";
  return (
    <dialog ref={dialog} className={s.dialog} aria-label="Search" onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === dialog.current) onClose(); }}>
      <div className={s.box}>
        <div className={s.inputRow}>
          <Icon name="search" size={18} />
          <input autoFocus className={s.input} placeholder="Search pages, actions, payment ID or reference…" value={q}
            onChange={(e) => { setQ(e.target.value); setIndex(0); }} onKeyDown={onKey}
            role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined} />
          <kbd className={s.kbd}>Esc</kbd>
        </div>
        <ul id="cmd-list" role="listbox" className={s.list}>
          {results.length === 0 && <li className={s.empty}>No results for “{q}”.</li>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? (lastGroup = c.group) : null;
            return (
              <li key={c.id} role="presentation">
                {header && <div className={s.group}>{header}</div>}
                <div id={`cmd-${c.id}`} role="option" aria-selected={i === index} className={cx(s.option, i === index && s.active)}
                  onMouseMove={() => setIndex(i)} onClick={() => go(c)}>
                  <Icon name={c.icon} size={16} /><span>{c.label}</span>{i === index && <Icon name="chevronRight" size={15} className={s.enter} />}
                </div>
              </li>
            );
          })}
        </ul>
        <div className={s.foot}><span><kbd className={s.kbd}>↑</kbd><kbd className={s.kbd}>↓</kbd> move</span><span><kbd className={s.kbd}>Enter</kbd> open</span></div>
      </div>
    </dialog>
  );
}
