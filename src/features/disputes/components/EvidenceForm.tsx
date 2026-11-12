"use client";
import { useRef, useState } from "react";
import { Button, Card, ErrorText, Input, Textarea, useConfirm, useToast } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { disputesApi, type Dispute } from "../api";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function EvidenceForm({ dispute, onChange }: { dispute: Dispute; onChange: () => void }) {
  const [text, setText] = useState(dispute.evidence_text ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useAction();
  const confirm = useConfirm();
  const toast = useToast();

  const pick = (list: FileList | null) => {
    const chosen = Array.from(list ?? []);
    const bad = chosen.find((f) => f.size > MAX_BYTES || !TYPES.includes(f.type));
    if (bad) { setError(`${bad.name}: use PDF, JPEG or PNG up to 5 MB.`); return; }
    if (dispute.files.length + chosen.length > MAX_FILES) { setError(`At most ${MAX_FILES} files in total.`); return; }
    setError(""); setFiles(chosen);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.set("text", text);
    files.forEach((f) => form.append("files", f));
    const ok = await run(() => disputesApi.saveEvidence(dispute.id, form));
    if (ok) { setFiles([]); if (input.current) input.current.value = ""; toast("Evidence saved"); onChange(); }
  };
  const submit = async () => {
    if (!(await confirm({ title: "Submit evidence for review?", body: "Your evidence goes to the card network. You cannot change it afterwards.", confirmLabel: "Submit" }))) return;
    if (await run(() => disputesApi.submit(dispute.id))) { toast("Evidence submitted"); onChange(); }
  };
  const accept = async () => {
    if (!(await confirm({ title: "Accept the dispute?", body: "The amount goes back to the customer and the dispute closes. This cannot be undone.", confirmLabel: "Accept dispute", danger: true }))) return;
    if (await run(() => disputesApi.accept(dispute.id))) { toast("Dispute accepted"); onChange(); }
  };

  return (
    <Card title="Your response" description="Explain what happened and attach proof. Save as often as you like, then submit once.">
      <form className="stack" onSubmit={save}>
        <Textarea label="What happened" rows={7} maxLength={10000} value={text} onChange={(e) => setText(e.target.value)}
          hint="Delivery date, who received it, conversations with the customer, your refund policy." />
        <Input ref={input} label="Files" type="file" multiple accept={TYPES.join(",")} onChange={(e) => pick(e.target.files)}
          hint={`Receipts, delivery proof, signed notes. PDF, JPEG or PNG, 5 MB each, ${MAX_FILES} files in total.`} />
        <ErrorText error={error} />
        <div className="cluster-between">
          <div className="cluster">
            <Button type="submit" loading={busy}>Save</Button>
            <Button variant="primary" onClick={submit} disabled={busy}>Submit for review</Button>
          </div>
          <Button variant="danger" onClick={accept} disabled={busy}>Accept dispute</Button>
        </div>
      </form>
    </Card>
  );
}
