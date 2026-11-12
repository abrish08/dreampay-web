import { api, seg } from "@/lib/api/client";

export type Address = { region: string; city: string; sub_city: string; woreda: string; house_number: string };
export type Owner = { full_name: string; id_type: string; id_number: string; date_of_birth: string; nationality: string; phone: string };
export type Profile = {
  business_type: string; legal_name: string; trade_name: string; registration_number: string; tin: string;
  trade_license_number: string; trade_license_expiry: string; vat_registered: boolean; vat_number: string;
  applicant_role: string; foreign_owned: boolean; regulated_sector: boolean; industry: string; website: string;
  description: string; expected_monthly_volume_etb: number; address: Address; owner: Owner; owner_identity_locked?: boolean;
};
export type KycDocument = { id: string; type: string; file_name: string; content_type: string; size: number; uploaded_at: string };
export type OwnerIdentity = { method: string; verified: boolean; verified_at?: string; name?: string; individual_id?: string; fayda_available: boolean };
export type Kyc = {
  status: string; profile: Profile; documents: KycDocument[]; required_documents: string[]; missing: string[];
  owner_identity: OwnerIdentity; submitted_at?: string; reviewed_at?: string; rejection_reason?: string;
};

export const BUSINESS_TYPES = [
  { value: "sole_proprietor", label: "Sole proprietor" },
  { value: "plc", label: "Private limited company (PLC)" },
  { value: "share_company", label: "Share company (S.C.)" },
  { value: "partnership", label: "Partnership" },
  { value: "ngo", label: "Civil society organisation" },
];
export const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "general_manager", label: "General manager" },
  { value: "authorized_representative", label: "Authorized representative" },
];
export const ID_TYPES = [
  { value: "fayda", label: "Fayda (national ID)" },
  { value: "passport", label: "Passport" },
  { value: "residence_permit", label: "Residence permit" },
];
export const REGIONS = ["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Central Ethiopia", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "South West Ethiopia", "Tigray"];

export const kycApi = {
  get: () => api<Kyc>("v1/kyc"),
  saveProfile: (p: Profile) => api<Kyc>("v1/kyc/profile", { method: "PUT", body: p }),
  upload: (type: string, file: File) => { const f = new FormData(); f.set("type", type); f.set("file", file); return api<KycDocument>("v1/kyc/documents", { method: "POST", form: f }); },
  remove: (id: string) => api(`v1/kyc/documents/${seg(id)}`, { method: "DELETE" }),
  link: (id: string) => api<{ url: string }>(`v1/kyc/documents/${seg(id)}`),
  submit: () => api<Kyc>("v1/kyc/submit", { method: "POST" }),
  startFayda: () => api<{ authorize_url: string }>("v1/kyc/fayda/start", { method: "POST" }),
};

export const isEditable = (status: string) => !["submitted", "approved", "waived"].includes(status);

const DOCUMENT_LABELS: Record<string, string> = {
  trade_license: "Trade license", commercial_registration: "Commercial registration certificate", tin_certificate: "TIN certificate",
  vat_certificate: "VAT certificate", memorandum_of_association: "Memorandum of association", shareholders_list: "List of shareholders",
  registration_certificate: "Registration certificate", business_address_proof: "Proof of business address", bank_account_proof: "Bank account letter",
  owner_id: "Owner's ID (passport or residence permit)", power_of_attorney: "Power of attorney", investment_permit: "Investment permit",
  certificate_of_competence: "Certificate of competence", other: "Other document",
};

const FIELD_LABELS: Record<string, string> = {
  business_type: "Legal form", legal_name: "Legal name", tin: "TIN", applicant_role: "Your role",
  "address.region and address.city": "Region and city", trade_license_number: "Trade license number",
  trade_license_expiry: "Trade license expiry date", registration_number: "Commercial registration number", vat_number: "VAT number",
  "owner.full_name": "Owner's full name", "owner.id_type and owner.id_number": "Owner's ID type and number", "owner.date_of_birth": "Owner's date of birth",
};

export const documentLabel = (type: string) => DOCUMENT_LABELS[type] ?? type.replaceAll("_", " ");

/** Turns the API's "missing" items into words people understand. */
export function missingLabel(item: string): string {
  if (FIELD_LABELS[item]) return FIELD_LABELS[item];
  if (item.startsWith("document: ")) return `Upload: ${documentLabel(item.slice("document: ".length))}`;
  if (item.startsWith("owner identity")) return "Verify the owner's identity with Fayda";
  return item.replaceAll("_", " ");
}
