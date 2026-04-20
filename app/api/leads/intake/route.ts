import { NextRequest, NextResponse } from "next/server";
import { ingestLeadAndQualify, LeadIntakeRequest } from "@/lib/server/lead-intake";
import { requireSessionContext } from "@/lib/server/auth-session";

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const payload = (await request.json()) as Omit<LeadIntakeRequest, "agencyId">;
    const result = await ingestLeadAndQualify({
      ...payload,
      agencyId
    });
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sesión inválida o expirada"
          }
        },
        { status: 401 }
      );
    }

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
