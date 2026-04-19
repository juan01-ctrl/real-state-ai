import { NextRequest, NextResponse } from "next/server";
import { getLeadInboxItems } from "@/lib/server/read-models/leads";

export async function GET(request: NextRequest) {
  const agencyId = request.nextUrl.searchParams.get("agencyId") ?? "agency_demo_001";
  const leads = await getLeadInboxItems(agencyId);
  return NextResponse.json({ ok: true, leads });
}
