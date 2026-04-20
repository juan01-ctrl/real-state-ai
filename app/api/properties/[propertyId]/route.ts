import { NextRequest, NextResponse } from "next/server";
import {
  deleteAgencyProperty,
  parsePropertyPayloadFromRequest,
  updateAgencyProperty
} from "@/lib/server/property-mutations";
import { requireSessionContext } from "@/lib/server/auth-session";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ propertyId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { agencyId } = await requireSessionContext();
    const { propertyId } = await params;
    const body = await request.json().catch(() => null);
    const parsed = parsePropertyPayloadFromRequest(body);
    if ("error" in parsed) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const result = await updateAgencyProperty(agencyId, propertyId, parsed);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { agencyId } = await requireSessionContext();
    const { propertyId } = await params;
    const result = await deleteAgencyProperty(agencyId, propertyId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
