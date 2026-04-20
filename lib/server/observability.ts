import { randomUUID } from "crypto";
import { db } from "@/lib/server/db";

export function buildTraceId() {
  return randomUUID();
}

export async function recordApiSliEvent(input: {
  agencyId: string;
  route: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  ok: boolean;
  traceId?: string;
}) {
  try {
    await db.analyticsEvent.create({
      data: {
        agencyId: input.agencyId,
        type: "api.request",
        properties: {
          route: input.route,
          method: input.method,
          statusCode: input.statusCode,
          latencyMs: Math.max(0, Math.round(input.latencyMs)),
          ok: input.ok,
          traceId: input.traceId ?? null
        },
        idempotencyKey: `api.request:${input.route}:${input.method}:${input.traceId ?? randomUUID()}`
      }
    });
  } catch {
    // Telemetría best-effort.
  }
}
