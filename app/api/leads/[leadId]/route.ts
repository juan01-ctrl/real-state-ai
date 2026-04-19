import { NextRequest, NextResponse } from "next/server";
import { getLeadSnapshot } from "@/lib/server/lead-intake";

interface RouteParams {
  params: Promise<{ leadId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { leadId } = await params;

  const lead = await getLeadSnapshot(leadId);
  if (!lead) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LEAD_NOT_FOUND",
          message: `El lead ${leadId} no existe`
        }
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, lead });
}
