import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <EmptyState icon="info" title="Page not found" description="The page you opened does not exist or was moved." action={<Link href="/">Go to the dashboard</Link>} />
    </main>
  );
}
