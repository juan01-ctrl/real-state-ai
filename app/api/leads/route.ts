import { NextRequest, NextResponse } from "next/server";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getLeadInboxItems } from "@/lib/server/read-models/leads";

export async function GET(_request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const leads = await getLeadInboxItems(agencyId);
    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    if (!(error instanceof Error && error.message === "UNAUTHORIZED")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "No se pudo cargar la bandeja de leads"
          }
        },
        { status: 500 }
      );
    }

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
}
