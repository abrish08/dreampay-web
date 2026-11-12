"use client";
import { PageHeader } from "@/components/ui";
import { ApiKeysCard } from "./ApiKeysCard";
import { WebhooksCard } from "./WebhooksCard";

export function DevelopersScreen() {
  return (
    <>
      <PageHeader title="Developers" description="Connect your website or app: API keys for your server and webhooks for payment updates." />
      <div className="stack">
        <ApiKeysCard />
        <WebhooksCard />
      </div>
    </>
  );
}
