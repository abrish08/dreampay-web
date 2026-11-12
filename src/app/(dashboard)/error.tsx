"use client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <EmptyState icon="alert" title="Something went wrong" description="This page could not be shown. Try again; if it keeps happening, contact support."
    action={<Button onClick={reset} icon="refresh">Try again</Button>} />;
}
