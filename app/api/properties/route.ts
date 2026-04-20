import { NextRequest, NextResponse } from "next/server";
import { createAgencyProperty, parsePropertyPayloadFromRequest } from "@/lib/server/property-mutations";
import { requireSessionContext } from "@/lib/server/auth-session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const body = await request.json().catch(() => null);
    const parsed = parsePropertyPayloadFromRequest(body);
    if ("error" in parsed) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const created = await createAgencyProperty(agencyId, parsed);
    return NextResponse.json({ ok: true, property: { id: created.id } }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
