"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Menu } from "@/components/ui/Menu";
import { api, type Page } from "@/lib/api/client";
import { money } from "@/lib/format";
import { isVerified, useSession } from "@/providers/SessionProvider";
import s from "./AppShell.module.css";

type Note = { id: string; icon: IconName; tone: "danger" | "warning" | "info"; title: string; body: string; href: string };

/** Things that need the merchant's attention, gathered from the API. */
function useNotes() {
  const { merchant } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const load = useCallback(async () => {
    const out: Note[] = [];
    const [disputes, deliveries, mfa] = await Promise.allSettled([
      api<Page<{ id: string; status: string; amount: number; currency: string; evidence_due_by: string }>>("v1/disputes"),
      api<Page<{ id: string; status: string; event_type: string }>>("v1/webhook-deliveries?limit=50"),
      api<{ enabled: boolean }>("auth/mfa"),
    ]);
    if (disputes.status === "fulfilled") {
      for (const d of disputes.value.data.filter((x) => x.status === "needs_response")) {
        out.push({ id: `d-${d.id}`, icon: "alert", tone: "danger", title: `Dispute: ${money(d.amount, d.currency)}`,
          body: `Respond by ${new Date(d.evidence_due_by).toLocaleDateString()}`, href: `/disputes/${d.id}` });
      }
    }
    if (merchant && !isVerified(merchant.kyc_status)) {
      out.push({ id: "kyc", icon: "badge", tone: "warning", title: "Verify your business", body: "Needed before live payments.", href: "/kyc" });
    }
    if (mfa.status === "fulfilled" && !mfa.value.enabled) {
      out.push({ id: "mfa", icon: "lock", tone: "warning", title: "Turn on two-factor authentication", body: "Protect your account with an authenticator app.", href: "/security" });
    }
    if (deliveries.status === "fulfilled") {
      const failed = deliveries.value.data.filter((x) => x.status === "failed").length;
      if (failed) out.push({ id: "wh", icon: "code", tone: "info", title: `${failed} webhook deliver${failed === 1 ? "y" : "ies"} failed`, body: "Your server did not accept them. Retry from Developers.", href: "/developers" });
    }
    setNotes(out);
  }, [merchant]);
  useEffect(() => { void load(); }, [load]);
  return { notes, load };
}

export function Notifications() {
  const { notes, load } = useNotes();
  return (
    <Menu kind="dialog" width={340} onOpen={() => void load()} trigger={(p) => (
      <span className={s.bellWrap}>
        <Button {...p} variant="ghost" iconOnly icon="bell" aria-label={`Notifications${notes.length ? `: ${notes.length} new` : ""}`} />
        {notes.length > 0 && <span className={s.bellDot} aria-hidden="true" />}
      </span>
    )}>
      <div className={s.notesHead}><strong>Notifications</strong><span className="small subtle">{notes.length || "None"}</span></div>
      {notes.length === 0 ? (
        <div className={s.notesEmpty}><Icon name="success" size={22} /><span>You are all caught up.</span></div>
      ) : (
        <ul className={s.notes}>
          {notes.map((n) => (
            <li key={n.id}>
              <Link href={n.href} className={s.note} data-tone={n.tone}>
                <span className={s.noteIcon}><Icon name={n.icon} size={16} /></span>
                <span><span className={s.noteTitle}>{n.title}</span><span className={s.noteBody}>{n.body}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Menu>
  );
}
