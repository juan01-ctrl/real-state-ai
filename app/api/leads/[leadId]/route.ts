import { NextRequest, NextResponse } from "next/server";
import { LeadStage } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getLeadSnapshot } from "@/lib/server/lead-intake";
import { patchLeadOperations } from "@/lib/server/lead-mutations";

interface RouteParams {
  params: Promise<{ leadId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const [{ leadId }, { agencyId }] = await Promise.all([params, requireSessionContext()]);
    const lead = await getLeadSnapshot(leadId, agencyId);
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
  } catch (error) {
    if (!(error instanceof Error && error.message === "UNAUTHORIZED")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "No se pudo obtener el lead"
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

interface LeadOperationPayload {
  stage?: LeadStage;
  ownerUserId?: string | null;
  note?: string;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const [{ leadId }, { agencyId, name }] = await Promise.all([params, requireSessionContext()]);
    const payload = (await request.json()) as LeadOperationPayload;

    const result = await patchLeadOperations(leadId, agencyId, payload, name || "Operador");

    if (!result.ok) {
      if (result.error === "NOT_FOUND") {
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
      if (result.error === "OWNER_NOT_FOUND") {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "OWNER_NOT_FOUND",
              message: "El owner indicado no pertenece a la agencia de la sesión"
            }
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_OPERATION",
            message: "Enviá al menos una operación: stage, ownerUserId o note"
          }
        },
        { status: 400 }
      );
    }

    const lead = await getLeadSnapshot(leadId, agencyId);
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    if (!(error instanceof Error && error.message === "UNAUTHORIZED")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "No se pudo aplicar la operación"
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
