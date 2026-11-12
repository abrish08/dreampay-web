import type { Metadata } from "next";
import { PaymentDetailScreen } from "@/features/payments";

export const metadata: Metadata = { title: "Payment" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentDetailScreen id={id} />;
}
