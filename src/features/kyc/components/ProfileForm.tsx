"use client";
import { useState } from "react";
import { Alert, Button, Card, Checkbox, ErrorText, Input, Select, Textarea, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { dateTime } from "@/lib/format";
import { BUSINESS_TYPES, ID_TYPES, kycApi, REGIONS, ROLES, type Address, type Kyc, type Owner, type Profile } from "../api";

export function ProfileForm({ kyc, editable, onSaved }: { kyc: Kyc; editable: boolean; onSaved: () => void }) {
  const [p, setP] = useState<Profile>(kyc.profile);
  const [dirty, setDirty] = useState(false);
  const { busy, error, run } = useAction();
  const toast = useToast();
  const identity = kyc.owner_identity;
  const ownerLocked = !editable || !!p.owner_identity_locked;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setP({ ...p, [k]: v }); setDirty(true); };
  const setAddr = (k: keyof Address, v: string) => set("address", { ...p.address, [k]: v });
  const setOwner = (k: keyof Owner, v: string) => set("owner", { ...p.owner, [k]: v });
  const text = (k: keyof Profile) => ({ value: (p[k] as string) ?? "", disabled: !editable, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value as never) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => kycApi.saveProfile(p))) { setDirty(false); toast("Saved"); onSaved(); }
  };
  const fayda = () => run(async () => { const r = await kycApi.startFayda(); window.location.assign(r.authorize_url); });

  return (
    <form className="stack" onSubmit={save}>
      <Card title="Business" description="As written on your trade license and commercial registration.">
        <div className="form-grid">
          <Select label="Legal form" placeholder="Choose…" options={BUSINESS_TYPES} value={p.business_type ?? ""} disabled={!editable} onChange={(e) => set("business_type", e.target.value)} />
          <Input label="Legal name" {...text("legal_name")} />
          <Input label="Trade name" optional {...text("trade_name")} />
          <Input label="TIN" inputMode="numeric" {...text("tin")} />
          <Input label="Commercial registration no." {...text("registration_number")} />
          {p.business_type !== "ngo" && <>
            <Input label="Trade license no." {...text("trade_license_number")} />
            <Input label="Trade license expiry" type="date" {...text("trade_license_expiry")} />
          </>}
          <Input label="Industry" optional placeholder="Retail, hospitality…" {...text("industry")} />
          <Input label="Website" optional type="url" placeholder="https://" {...text("website")} />
          <Input label="Expected monthly volume (ETB)" optional inputMode="numeric" value={p.expected_monthly_volume_etb ? String(p.expected_monthly_volume_etb) : ""} disabled={!editable}
            onChange={(e) => set("expected_monthly_volume_etb", Number(e.target.value.replace(/\D/g, "")) || 0)} />
          <Textarea label="What do you sell?" optional className="span-all" rows={3} value={p.description ?? ""} disabled={!editable} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="cluster" style={{ gap: "10px 24px", marginTop: 16 }}>
          <Checkbox label="VAT registered" checked={!!p.vat_registered} disabled={!editable} onChange={(e) => set("vat_registered", e.target.checked)} />
          <Checkbox label="Foreign owned" checked={!!p.foreign_owned} disabled={!editable} onChange={(e) => set("foreign_owned", e.target.checked)} />
          <Checkbox label="Regulated sector" hint="Health, finance, education…" checked={!!p.regulated_sector} disabled={!editable} onChange={(e) => set("regulated_sector", e.target.checked)} />
        </div>
        {p.vat_registered && <div className="form-grid" style={{ marginTop: 16 }}><Input label="VAT number" {...text("vat_number")} /></div>}
      </Card>

      <Card title="Address">
        <div className="form-grid">
          <Select label="Region" placeholder="Choose…" options={REGIONS} value={p.address?.region ?? ""} disabled={!editable} onChange={(e) => setAddr("region", e.target.value)} />
          <Input label="City" value={p.address?.city ?? ""} disabled={!editable} onChange={(e) => setAddr("city", e.target.value)} />
          <Input label="Sub-city" optional value={p.address?.sub_city ?? ""} disabled={!editable} onChange={(e) => setAddr("sub_city", e.target.value)} />
          <Input label="Woreda" optional value={p.address?.woreda ?? ""} disabled={!editable} onChange={(e) => setAddr("woreda", e.target.value)} />
          <Input label="House no." optional value={p.address?.house_number ?? ""} disabled={!editable} onChange={(e) => setAddr("house_number", e.target.value)} />
        </div>
      </Card>

      <Card title="Owner or applicant" description="The person responsible for this account.">
        <div className="stack">
          <div className="form-grid">
            <Select label="Your role" placeholder="Choose…" options={ROLES} value={p.applicant_role ?? ""} disabled={!editable} onChange={(e) => set("applicant_role", e.target.value)} />
            <Select label="ID type" placeholder="Choose…" options={ID_TYPES} value={p.owner?.id_type ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("id_type", e.target.value)} />
          </div>
          {identity.verified ? (
            <Alert tone="success" title="Verified with Fayda">{identity.name} · {identity.individual_id} · {dateTime(identity.verified_at)}</Alert>
          ) : (
            <>
              {identity.fayda_available && editable && (
                <Alert tone="info" title="Fastest: verify with Fayda" action={<Button size="sm" variant="primary" onClick={fayda} disabled={busy}>Verify with Fayda</Button>}>
                  Sign in with your national ID. No ID document upload needed.
                </Alert>
              )}
              <div className="form-grid">
                <Input label="Full name" value={p.owner?.full_name ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("full_name", e.target.value)} />
                <Input label="ID number" value={p.owner?.id_number ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("id_number", e.target.value)} />
                <Input label="Date of birth" type="date" value={p.owner?.date_of_birth ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("date_of_birth", e.target.value)} />
                <Input label="Nationality" optional value={p.owner?.nationality ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("nationality", e.target.value)} />
                <Input label="Phone" optional type="tel" value={p.owner?.phone ?? ""} disabled={ownerLocked} onChange={(e) => setOwner("phone", e.target.value)} />
              </div>
            </>
          )}
        </div>
      </Card>

      {editable && (
        <div className="cluster">
          <Button type="submit" variant="primary" loading={busy} disabled={!dirty}>Save details</Button>
          {dirty && <span className="small muted">You have unsaved changes.</span>}
        </div>
      )}
      <ErrorText error={error} />
    </form>
  );
}
