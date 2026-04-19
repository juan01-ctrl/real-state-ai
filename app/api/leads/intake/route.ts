import { NextRequest, NextResponse } from "next/server";
import { ingestLeadAndQualify, LeadIntakeRequest } from "@/lib/server/lead-intake";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LeadIntakeRequest;
    const result = await ingestLeadAndQualify(payload);
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al ingresar el lead";
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LEAD_INTAKE_FAILED",
          message
        }
      },
      { status: 400 }
    );
  }
}
