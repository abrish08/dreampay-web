"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { Segmented } from "@/components/ui/Segmented";
import { isTheme, THEME_COOKIE, type Theme } from "@/lib/theme";

function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (isTheme(t)) setTheme(t);
  }, []);
  const change = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${THEME_COOKIE}=${t}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  };
  return [theme, change] as const;
}

/** Light / dark / system as three buttons (sign-in pages). */
export function ThemeToggle() {
  const [theme, change] = useTheme();
  return (
    <Segmented label="Colour theme" value={theme} onChange={change} options={[
      { value: "light", label: "Light theme", icon: "sun", iconOnly: true },
      { value: "dark", label: "Dark theme", icon: "moon", iconOnly: true },
      { value: "system", label: "Use system setting", icon: "monitor", iconOnly: true },
    ]} />
  );
}

/** One icon button with a small menu (top bar). */
export function ThemeMenu() {
  const [theme, change] = useTheme();
  const icon = theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor";
  return (
    <Menu trigger={(p) => <Button {...p} variant="ghost" iconOnly icon={icon} aria-label="Colour theme" />}>
      <MenuItem icon="sun" checked={theme === "light"} onSelect={() => change("light")}>Light</MenuItem>
      <MenuItem icon="moon" checked={theme === "dark"} onSelect={() => change("dark")}>Dark</MenuItem>
      <MenuItem icon="monitor" checked={theme === "system"} onSelect={() => change("system")}>System</MenuItem>
    </Menu>
  );
}
