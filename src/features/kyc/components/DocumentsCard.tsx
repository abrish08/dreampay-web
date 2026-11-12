"use client";
import { useRef, useState } from "react";
import { Button, Card, ErrorText, Icon, Input, Select, StatusBadge, useConfirm, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { dateOnly, fileSize } from "@/lib/format";
import { documentLabel, kycApi, type Kyc } from "../api";

const MAX = 5 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function DocumentsCard({ kyc, editable, onChange }: { kyc: Kyc; editable: boolean; onChange: () => void }) {
  const types = [...new Set([...kyc.required_documents, "other"])];
  const have = new Set(kyc.documents.map((d) => d.type));
  const [type, setType] = useState(types.find((t) => !have.has(t)) ?? "other");
  const [file, setFile] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const pick = (f: File | null) => {
    if (f && (f.size > MAX || !TYPES.includes(f.type))) { setError("Use a PDF, JPEG or PNG file up to 5 MB."); setFile(null); return; }
    setError(""); setFile(f);
  };
  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (await run(() => kycApi.upload(type, file))) {
      setFile(null); if (input.current) input.current.value = "";
      toast("Document uploaded"); onChange();
    }
  };
  const view = (id: string) => run(async () => { const r = await kycApi.link(id); window.open(r.url, "_blank", "noopener,noreferrer"); });
  const remove = async (id: string) => {
    if (!(await confirm({ title: "Remove this document?", confirmLabel: "Remove", danger: true }))) return;
    if (await run(() => kycApi.remove(id))) onChange();
  };

  return (
    <Card title="Documents" description="Clear scans or photos. Every page, every corner visible.">
      <div className="stack">
        <ul className="stack-sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {kyc.required_documents.map((t) => (
            <li key={t} className="cluster-between">
              <span className="cluster"><Icon name={have.has(t) ? "success" : "file"} size={17} /><span>{documentLabel(t)}</span></span>
              <StatusBadge status={have.has(t) ? "submitted" : "pending"} />
            </li>
          ))}
        </ul>
        {kyc.documents.length > 0 && (
          <div className="stack-sm" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
            {kyc.documents.map((d) => (
              <div key={d.id} className="cluster-between">
                <div style={{ minWidth: 0 }}>
                  <div className="truncate">{d.file_name}</div>
                  <div className="small subtle">{documentLabel(d.type)} · {fileSize(d.size)} · {dateOnly(d.uploaded_at)}</div>
                </div>
                <div className="cluster">
                  <Button size="sm" icon="external" onClick={() => view(d.id)}>View</Button>
                  {editable && <Button size="sm" variant="ghost" iconOnly icon="trash" aria-label={`Remove ${d.file_name}`} onClick={() => remove(d.id)} />}
                </div>
              </div>
            ))}
          </div>
        )}
        {editable && (
          <form className="form-grid" onSubmit={upload} style={{ alignItems: "end", borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
            <Select label="Document" options={types.map((t) => ({ value: t, label: documentLabel(t) }))} value={type} onChange={(e) => setType(e.target.value)} />
            <Input ref={input} label="File" type="file" required accept={TYPES.join(",")} hint="PDF, JPEG or PNG, up to 5 MB" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
            <div><Button type="submit" variant="primary" icon="upload" loading={busy} disabled={!file}>Upload</Button></div>
          </form>
        )}
        <ErrorText error={error} />
      </div>
    </Card>
  );
}
