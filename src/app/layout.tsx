import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE } from "@/lib/theme";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: { default: "Paygate", template: "%s · Paygate" },
  description: "Paygate merchant dashboard",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e13" },
  ],
};

// The theme comes from a cookie, so the first paint already has the right
// colours: no flash and no inline script (the CSP stays strict).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  return (
    <html lang="en" data-theme={isTheme(saved) ? saved : "system"}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
