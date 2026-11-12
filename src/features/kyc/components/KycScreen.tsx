"use client";
import { Button, Card, ErrorText, PageHeader, StatusBadge, useConfirm, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useResource } from "@/hooks/useResource";
import { isEditable, kycApi } from "../api";
import { DocumentsCard } from "./DocumentsCard";
import { KycStatus } from "./KycStatus";
import { ProfileForm } from "./ProfileForm";

export function KycScreen() {
  const kyc = useResource(() => kycApi.get(), []);
  const { busy, error, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();
  const k = kyc.data;
  if (!k) return <><PageHeader title="Business verification" />{kyc.loading ? <p className="muted">Loading…</p> : <ErrorText error={kyc.error} />}</>;

  const editable = isEditable(k.status);
  const submit = async () => {
    if (!(await confirm({ title: "Submit for review?", body: "You cannot edit your application while we review it.", confirmLabel: "Submit" }))) return;
    if (await run(() => kycApi.submit())) { toast("Application submitted"); kyc.reload(); }
  };

  return (
    <>
      <PageHeader title="Business verification" badge={<StatusBadge status={k.status} />}
        description="The National Bank of Ethiopia requires us to verify every business before it receives live payments." />
      <div className="stack">
        <KycStatus kyc={k} />
        <div className="split">
          <ProfileForm key={k.status} kyc={k} editable={editable} onSaved={kyc.reload} />
          <DocumentsCard kyc={k} editable={editable} onChange={kyc.reload} />
        </div>
        {editable && (
          <Card footer={<div className="cluster-between">
            <span className="small muted">{k.missing.length ? "Complete the missing items first." : "Ready to submit."}</span>
            <Button variant="primary" onClick={submit} loading={busy} disabled={k.missing.length > 0}>Submit for review</Button>
          </div>} />
        )}
        <ErrorText error={error} />
      </div>
    </>
  );
}
