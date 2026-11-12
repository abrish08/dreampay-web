"use client";
import { Button, Card, CopyButton, DataTable, EmptyState, ErrorText, PageHeader, StatusBadge, useConfirm, useToast, type Column } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { errorMessage } from "@/lib/api/client";
import { dateOnly, money } from "@/lib/format";
import { useEnv } from "@/providers/EnvProvider";
import { linksApi, type PaymentLink } from "../api";
import { CreateLinkForm } from "./CreateLinkForm";

export function LinksScreen() {
  const { env } = useEnv();
  const links = useResource(() => linksApi.list(env), [env]);
  const confirm = useConfirm();
  const toast = useToast();

  const deactivate = async (l: PaymentLink) => {
    if (!(await confirm({ title: "Deactivate this link?", body: "Customers who open it will see that it is no longer available.", confirmLabel: "Deactivate", danger: true }))) return;
    try { await linksApi.deactivate(l.id); toast("Link deactivated"); links.reload(); } catch (e) { toast(errorMessage(e), "danger"); }
  };

  const columns: Column<PaymentLink>[] = [
    { key: "amount", header: "Amount", cell: (l) => <span className="strong num">{money(l.amount, l.currency)}</span> },
    { key: "desc", header: "Link", cell: (l) => <div style={{ maxWidth: 360 }}><div className="truncate">{l.description || l.reference || "Payment link"}</div><div className="mono small subtle truncate">{l.url}</div></div> },
    { key: "type", header: "Type", cell: (l) => <span className="small">{l.single_use ? "Single use" : "Reusable"}</span> },
    { key: "paid", header: "Paid", align: "right", cell: (l) => <span className="num">{l.paid_count}</span> },
    { key: "status", header: "Status", cell: (l) => <StatusBadge status={l.active ? "active" : "inactive"} /> },
    { key: "created", header: "Created", cell: (l) => <span className="small muted">{dateOnly(l.created_at)}</span> },
    { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (l) => l.active && (
      <div className="cluster" style={{ justifyContent: "flex-end" }}><CopyButton value={l.url} /><Button size="sm" variant="ghost" onClick={() => deactivate(l)}>Deactivate</Button></div>
    ) },
  ];

  return (
    <>
      <PageHeader title="Payment links" description="Get paid without a website: create a link and send it to your customer." />
      <div className="stack">
        <CreateLinkForm onCreated={links.reload} />
        <Card title="Your links" flush>
          <ErrorText error={links.error} />
          <DataTable label="Payment links" columns={columns} rows={links.data?.data} rowKey={(l) => l.id} loading={links.loading}
            empty={<EmptyState icon="link" title="No links yet" description="Links you create appear here." />} />
        </Card>
      </div>
    </>
  );
}
