"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EnvProvider, useEnv } from "@/providers/EnvProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { CommandPalette } from "./CommandPalette";
import { Notifications } from "./Notifications";
import { Sidebar } from "./Sidebar";
import { ThemeMenu } from "./ThemeToggle";
import s from "./AppShell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <SessionProvider><EnvProvider><Frame>{children}</Frame></EnvProvider></SessionProvider>;
}

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { env, setEnv } = useEnv();
  const [nav, setNav] = useState(false);
  const [search, setSearch] = useState(false);
  const [mac, setMac] = useState(false);
  useEffect(() => setNav(false), [path]);
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((v) => !v); } };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  return (
    <div className={s.shell} data-nav-open={nav || undefined}>
      <a href="#content" className={s.skip}>Skip to content</a>
      <Sidebar id="sidebar" />
      <div className={s.scrim} onClick={() => setNav(false)} aria-hidden="true" />
      <div className={s.main}>
        <header className={s.topbar}>
          <Button variant="ghost" iconOnly icon="menu" className={s.menuBtn} onClick={() => setNav(true)} aria-label="Open menu" aria-controls="sidebar" aria-expanded={nav} />
          <button type="button" className={s.search} onClick={() => setSearch(true)}>
            <Icon name="search" size={16} /><span>Search…</span><kbd>{mac ? "⌘" : "Ctrl"} K</kbd>
          </button>
          <div className={s.spacer} />
          {env === "test" && (
            <button type="button" className={s.testPill} onClick={() => setEnv("live")} title="You are viewing test data. Click to switch to live.">
              <span className={s.testDot} />Test mode
            </button>
          )}
          <ThemeMenu />
          <Notifications />
        </header>
        <main id="content" className={s.content} tabIndex={-1}>{children}</main>
      </div>
      <CommandPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
