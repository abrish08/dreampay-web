import { NextResponse } from "next/server";
import { forbidden, sameOrigin } from "@/lib/server/csrf";
import { callAPI, readJSON } from "@/lib/server/upstream";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const b = await req.json().catch(() => ({}));
  const res = await callAPI("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ business_name: b.business_name, name: b.name, email: b.email, password: b.password, phone: b.phone }),
  });
  return NextResponse.json(await readJSON(res), { status: res.status });
}
