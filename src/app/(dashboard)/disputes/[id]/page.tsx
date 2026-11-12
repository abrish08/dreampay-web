import type { Metadata } from "next";
import { DisputeDetailScreen } from "@/features/disputes";

export const metadata: Metadata = { title: "Dispute" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DisputeDetailScreen id={id} />;
}
