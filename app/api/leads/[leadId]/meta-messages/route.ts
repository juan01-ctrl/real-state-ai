import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/server/audit";
import { requirePermission } from "@/lib/server/auth-session";
import { buildTraceId, recordApiSliEvent } from "@/lib/server/observability";
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
  const startedAt = Date.now();
  const traceId = buildTraceId();
  try {
    const [{ leadId }, { agencyId, name, userId }] = await Promise.all([params, requirePermission("leads.write")]);
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
      await recordApiSliEvent({
        agencyId,
        route: "/api/leads/[leadId]/meta-messages",
        method: "POST",
        statusCode: status,
        latencyMs: Date.now() - startedAt,
        ok: false,
        traceId
      });
      return NextResponse.json({ ok: false, error: result.code, message: result.message }, { status });
    }

    await logAuditEvent({
      agencyId,
      userId,
      action: "lead.message.draft_created",
      resource: "Lead",
      resourceId: leadId,
      summary: "Borrador de mensaje generado"
    });

    await recordApiSliEvent({
      agencyId,
      route: "/api/leads/[leadId]/meta-messages",
      method: "POST",
      statusCode: 200,
      latencyMs: Date.now() - startedAt,
      ok: true,
      traceId
    });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    throw e;
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const startedAt = Date.now();
  const traceId = buildTraceId();
  try {
    const [{ leadId }, { agencyId, name, userId }] = await Promise.all([params, requirePermission("leads.write")]);
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
      await recordApiSliEvent({
        agencyId,
        route: "/api/leads/[leadId]/meta-messages",
        method: "PATCH",
        statusCode: 200,
        latencyMs: Date.now() - startedAt,
        ok: true,
        traceId
      });
      await logAuditEvent({
        agencyId,
        userId,
        action: "lead.message.approved",
        resource: "Message",
        resourceId: result.messageId,
        summary: "Mensaje aprobado y encolado para envío",
        metadata: {
          queuedJobId: result.queuedJobId,
          deliveryStatus: result.deliveryStatus
        }
      });
      return NextResponse.json({
        ok: true,
        messageId: result.messageId,
        queuedJobId: result.queuedJobId,
        deliveryStatus: result.deliveryStatus
      });
    }

    if (action === "discard") {
      const result = await discardMetaOutboundDraft(leadId, messageId, agencyId);
      if (!result.ok) {
        const status = result.code === "NOT_FOUND" ? 404 : 400;
        return NextResponse.json({ ok: false, error: result.code, message: result.message }, { status });
      }
      await logAuditEvent({
        agencyId,
        userId,
        action: "lead.message.discarded",
        resource: "Message",
        resourceId: messageId,
        summary: "Borrador descartado"
      });
      await recordApiSliEvent({
        agencyId,
        route: "/api/leads/[leadId]/meta-messages",
        method: "PATCH",
        statusCode: 200,
        latencyMs: Date.now() - startedAt,
        ok: true,
        traceId
      });
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
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    throw e;
  }
}
