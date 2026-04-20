import { NextRequest, NextResponse } from "next/server";
import { requireSessionContext } from "@/lib/server/auth-session";
import {
  approveMetaOutboundDraft,
  discardMetaOutboundDraft,
  sendMetaOutboundMessage
} from "@/lib/server/send-meta-outbound";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ leadId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const [{ leadId }, { agencyId, name }] = await Promise.all([params, requireSessionContext()]);
    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";

    const result = await sendMetaOutboundMessage(leadId, agencyId, text, name || "Agente");

    if (!result.ok) {
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "GRAPH_ERROR"
            ? 502
            : result.code === "ENCRYPTION_NOT_CONFIGURED"
              ? 503
              : 400;
      return NextResponse.json({ ok: false, error: result.code, message: result.message }, { status });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const [{ leadId }, { agencyId, name }] = await Promise.all([params, requireSessionContext()]);
    const body = (await request.json()) as { action?: string; messageId?: string };
    const action = typeof body.action === "string" ? body.action : "";
    const messageId = typeof body.messageId === "string" ? body.messageId : "";

    if (!messageId.trim()) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT", message: "Falta el ID del borrador." }, { status: 400 });
    }

    if (action === "approve") {
      const result = await approveMetaOutboundDraft(leadId, messageId, agencyId, name || "Agente");
      if (!result.ok) {
        const status =
          result.code === "NOT_FOUND"
            ? 404
            : result.code === "GRAPH_ERROR"
              ? 502
              : result.code === "ENCRYPTION_NOT_CONFIGURED"
                ? 503
                : 400;
        return NextResponse.json({ ok: false, error: result.code, message: result.message }, { status });
      }
      return NextResponse.json({ ok: true, messageId: result.messageId });
    }

    if (action === "discard") {
      const result = await discardMetaOutboundDraft(leadId, messageId, agencyId);
      if (!result.ok) {
        const status = result.code === "NOT_FOUND" ? 404 : 400;
        return NextResponse.json({ ok: false, error: result.code, message: result.message }, { status });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "INVALID_ACTION", message: "Acción inválida. Usá approve o discard." },
      { status: 400 }
    );
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
