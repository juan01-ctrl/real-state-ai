import { NextRequest, NextResponse } from "next/server";
import { requireSessionContext } from "@/lib/server/auth-session";
import { sendMetaOutboundMessage } from "@/lib/server/send-meta-outbound";

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
