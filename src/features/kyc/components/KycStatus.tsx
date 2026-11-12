import { Alert } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { missingLabel, type Kyc } from "../api";

export function KycStatus({ kyc }: { kyc: Kyc }) {
  switch (kyc.status) {
    case "approved":
    case "waived":
      return <Alert tone="success" title="Your business is verified">Live payments are on.</Alert>;
    case "submitted":
      return <Alert tone="info" title="We are reviewing your application">Submitted {dateTime(kyc.submitted_at)}. We will email you, usually within 2 business days.</Alert>;
    case "rejected":
      return <Alert tone="danger" title="Changes needed">{kyc.rejection_reason || "Please check your details."} Fix the items below and submit again.</Alert>;
    default:
      return kyc.missing.length > 0 ? (
        <Alert tone="warning" title={`${kyc.missing.length} item${kyc.missing.length === 1 ? "" : "s"} left before you can submit`}>
          <ul className="list small" style={{ columns: "2 240px", columnGap: 32 }}>{kyc.missing.map((m) => <li key={m}>{missingLabel(m)}</li>)}</ul>
        </Alert>
      ) : <Alert tone="success" title="Everything is in place">Submit your application at the bottom of the page.</Alert>;
  }
}
