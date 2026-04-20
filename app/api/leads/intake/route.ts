import { NextRequest, NextResponse } from "next/server";
import { ingestLeadAndQualify, LeadIntakeRequest } from "@/lib/server/lead-intake";
import { requirePermission } from "@/lib/server/auth-session";
import { buildTraceId, recordApiSliEvent } from "@/lib/server/observability";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = buildTraceId();
  let agencyIdForSli: string | null = null;
  try {
    const { agencyId } = await requirePermission("leads.write");
    agencyIdForSli = agencyId;
    const payload = (await request.json()) as Omit<LeadIntakeRequest, "agencyId">;
    const result = await ingestLeadAndQualify({
      ...payload,
      agencyId
    });
    await recordApiSliEvent({
      agencyId,
      route: "/api/leads/intake",
      method: "POST",
      statusCode: 201,
      latencyMs: Date.now() - startedAt,
      ok: true,
      traceId
    });
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      if (agencyIdForSli) {
        await recordApiSliEvent({
          agencyId: agencyIdForSli,
          route: "/api/leads/intake",
          method: "POST",
          statusCode: 401,
          latencyMs: Date.now() - startedAt,
          ok: false,
          traceId
        });
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
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "No tenés permisos para crear leads"
          }
        },
        { status: 403 }
      );
    }

    const message = error instanceof Error ? error.message : "Error desconocido al ingresar el lead";
    if (agencyIdForSli) {
      await recordApiSliEvent({
        agencyId: agencyIdForSli,
        route: "/api/leads/intake",
        method: "POST",
        statusCode: 400,
        latencyMs: Date.now() - startedAt,
        ok: false,
        traceId
      });
    }
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
