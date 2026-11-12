import type { IconName } from "@/components/ui/Icon";

export type NavItem = { href: string; label: string; icon: IconName; keywords?: string };
export type NavGroup = { title: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  { title: "Main", items: [
    { href: "/", label: "Dashboard", icon: "home", keywords: "overview balance home" },
    { href: "/payments", label: "Payments", icon: "card", keywords: "transactions orders" },
    { href: "/links", label: "Payment links", icon: "link", keywords: "invoice share" },
    { href: "/payouts", label: "Payouts", icon: "bank", keywords: "withdraw bank transfer settlement" },
    { href: "/disputes", label: "Disputes", icon: "alert", keywords: "chargeback evidence" },
    { href: "/reports", label: "Reports", icon: "file", keywords: "csv export statement" },
  ] },
  { title: "Others", items: [
    { href: "/activity", label: "Activity log", icon: "activity", keywords: "audit history who did what security" },
    { href: "/developers", label: "Developers", icon: "code", keywords: "api keys webhooks" },
    { href: "/kyc", label: "Business verification", icon: "badge", keywords: "kyc documents fayda" },
    { href: "/security", label: "Security", icon: "lock", keywords: "mfa password authenticator" },
  ] },
];
