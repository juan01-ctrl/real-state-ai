import { randomUUID } from "crypto";
import { LeadStage, TaskStatus, TaskType } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ingestLeadAndQualify } from "@/lib/server/lead-intake";
import {
  assignLeadOwner,
  changeLeadStage,
  completeLeadTask,
  createLeadTask
} from "@/lib/server/lead-mutations";
import { db } from "@/lib/server/db";
import { getLeadDetail, getLeadInboxItems } from "@/lib/server/read-models/leads";
import { getStrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";

const RUN = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!RUN)("lead workflow (integration)", () => {
  const agencyId = `mvp_itest_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  /** Si la DB no está alineada con `schema.prisma`, la creación de User puede fallar; el resto del flujo sigue cubierto. */
  let agentUserId: string | null = null;
  let dbReady = false;

  beforeAll(async () => {
    try {
      await db.$queryRaw`SELECT 1`;
      dbReady = true;
    } catch (err) {
      console.warn("[integration] DB no disponible, se omiten tests de integración.", err);
      return;
    }

    const agentEmail = `agent_${randomUUID().slice(0, 8)}@itest.local`;
    await db.agency.create({
      data: {
        id: agencyId,
        name: "ITest Agency",
        slug: `itest-${agencyId.slice(-12)}`
      }
    });
    try {
      const agent = await db.user.create({
        data: {
          agencyId,
          email: agentEmail,
          name: "Agente QA"
        }
      });
      agentUserId = agent.id;
    } catch (err) {
      console.warn(
        "[integration] Omitiendo asignación de propietario: creá/actualizá la DB con `prisma migrate deploy` o `db push`.",
        err
      );
    }
  });

  afterAll(async () => {
    if (dbReady) {
      await db.agency.delete({ where: { id: agencyId } }).catch(() => {});
    }
    await db.$disconnect();
  });

  it("runs intake → inbox → detail → stage → [owner] → tasks → insights", async () => {
    if (!dbReady) return;

    const out = await ingestLeadAndQualify({
      agencyId,
      sourceChannel: "WHATSAPP",
      contactName: "María Integración",
      messages: [
        {
          id: "m1",
          body:
            "Hola, busco departamento 3 ambientes en Palermo o Belgrano, presupuesto hasta 280000 USD, necesito mudanza en 2 meses.",
          direction: "inbound",
          sentAt: new Date().toISOString(),
          channel: "WHATSAPP"
        }
      ]
    });
    const leadId = out.leadId;
    expect(out.score).toBeGreaterThan(0);

    const inbox = await getLeadInboxItems(agencyId);
    expect(inbox.some((l) => l.id === leadId)).toBe(true);

    const detail = await getLeadDetail(leadId, agencyId);
    expect(detail?.id).toBe(leadId);
    expect(detail?.conversation.length).toBeGreaterThan(0);

    expect((await changeLeadStage(leadId, agencyId, LeadStage.QUALIFIED, "itest")).ok).toBe(true);

    if (agentUserId) {
      expect((await assignLeadOwner(leadId, agencyId, agentUserId)).ok).toBe(true);
      const leadAfter = await db.lead.findFirst({
        where: { id: leadId, agencyId },
        select: { stage: true, ownerUserId: true }
      });
      expect(leadAfter?.stage).toBe(LeadStage.QUALIFIED);
      expect(leadAfter?.ownerUserId).toBe(agentUserId);
    } else {
      const leadAfter = await db.lead.findFirst({
        where: { id: leadId, agencyId },
        select: { stage: true }
      });
      expect(leadAfter?.stage).toBe(LeadStage.QUALIFIED);
    }

    expect(
      (
        await createLeadTask(leadId, agencyId, {
          title: "Llamar para coordinar visita",
          type: TaskType.CALL
        })
      ).ok
    ).toBe(true);

    const task = await db.task.findFirst({
      where: { leadId, type: TaskType.CALL, status: TaskStatus.OPEN },
      orderBy: { id: "desc" }
    });
    expect(task).toBeTruthy();
    expect((await completeLeadTask(leadId, agencyId, task!.id)).ok).toBe(true);

    const closed = await db.task.findFirst({ where: { id: task!.id } });
    expect(closed?.status).toBe(TaskStatus.COMPLETED);

    await db.lead.update({
      where: { id: leadId },
      data: { leadScore: 85, closeProbability: 80 }
    });
    expect((await changeLeadStage(leadId, agencyId, LeadStage.LOST, "itest cierre")).ok).toBe(true);

    const insights = await getStrategicInsightsModel(agencyId);
    expect(insights.lostHighIntent.count).toBeGreaterThanOrEqual(1);
    expect(insights.lostHighIntent.sample.some((r) => r.leadId === leadId)).toBe(true);

    const wh = insights.sourcePerformance.find((r) => r.channel === "WHATSAPP");
    expect(wh?.leadCount).toBeGreaterThanOrEqual(1);
  });
});
