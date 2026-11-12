"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Menu";
import { authPost } from "@/lib/api/client";
import { useEnv } from "@/providers/EnvProvider";
import { isVerified, useSession } from "@/providers/SessionProvider";
import { navigation } from "./nav";
import s from "./AppShell.module.css";

export function Sidebar({ id }: { id: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  return (
    <aside className={s.sidebar} id={id}>
      <Workspace />
      <nav aria-label="Main" className={s.nav}>
        {navigation.map((g) => (
          <div key={g.title} className={s.group}>
            <div className={s.groupTitle}>{g.title}</div>
            {g.items.map((it) => {
              const on = active(it.href);
              return (
                <Link key={it.href} href={it.href} className={s.link} aria-current={on ? "page" : undefined}>
                  <Icon name={it.icon} size={18} /><span>{it.label}</span>{on && <Icon name="chevronRight" size={15} className={s.linkChevron} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <UserCard />
    </aside>
  );
}

/** Logo plus the test/live switcher (like a workspace switcher). */
function Workspace() {
  const { env, setEnv } = useEnv();
  return (
    <div className={s.workspace}>
      <Link href="/" className={s.brand}><span className={s.logo} aria-hidden="true">P</span>Paygate</Link>
      <Menu align="start" width={230} trigger={(p) => (
        <button {...p} type="button" className={s.switcher} aria-label={`Mode: ${env}. Switch mode`}><Icon name="chevronsUpDown" size={15} /></button>
      )}>
        <MenuLabel>Data shown</MenuLabel>
        <MenuItem icon="code" checked={env === "test"} onSelect={() => setEnv("test")}>Test mode</MenuItem>
        <MenuItem icon="wallet" checked={env === "live"} onSelect={() => setEnv("live")}>Live mode</MenuItem>
      </Menu>
    </div>
  );
}

function UserCard() {
  const { me, merchant } = useSession();
  const signOut = async () => { await authPost("logout", {}).catch(() => {}); window.location.assign("/login"); };
  const initials = (me?.name || me?.email || "·").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Menu align="start" width={232} trigger={(p) => (
      <button {...p} type="button" className={s.user}>
        <span className={s.avatar}>{initials}</span>
        <span className={s.userText}>
          <span className={s.userName}>
            <span className="truncate">{me?.name ?? "…"}</span>
            {isVerified(merchant?.kyc_status) && <span className={s.verified} title="Verified business"><Icon name="verified" size={15} /></span>}
          </span>
          <span className={s.userMail}>{me?.email}</span>
        </span>
        <Icon name="chevronRight" size={16} />
      </button>
    )}>
      <MenuLabel>{merchant?.name ?? "Your business"}</MenuLabel>
      <MenuItem icon="badge" href="/kyc">Business verification</MenuItem>
      <MenuItem icon="lock" href="/security">Security</MenuItem>
      <MenuSeparator />
      <MenuItem icon="logout" danger onSelect={signOut}>Sign out</MenuItem>
    </Menu>
  );
}
