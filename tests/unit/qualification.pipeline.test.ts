import { describe, expect, it } from "vitest";
import { runLeadExtraction } from "@/lib/qualification/extractors";
import { recommendNextAction } from "@/lib/qualification/next-action";
import { runLeadQualificationPipeline } from "@/lib/qualification/pipeline";
import { runScoring } from "@/lib/qualification/scoring";
import type { InboundConversationMessage } from "@/lib/qualification/types";

function inbound(id: string, body: string): InboundConversationMessage {
  return {
    id,
    body,
    direction: "inbound",
    sentAt: new Date().toISOString(),
    channel: "WHATSAPP"
  };
}

describe("qualification pipeline", () => {
  it("extracts budget, zones, property type and urgency clues", () => {
    const messages = [
      inbound("m1", "Busco depto en Palermo o Belgrano, presupuesto USD 240k-280k, necesito mudarme en 2 meses.")
    ];

    const extraction = runLeadExtraction(messages);
    expect(extraction.budget.value?.min).toBe(240000);
    expect(extraction.budget.value?.max).toBe(280000);
    expect(extraction.preferredZones.value).toContain("Palermo");
    expect(extraction.preferredZones.value).toContain("Belgrano");
    expect(extraction.propertyType.value).toBe("apartment");
    expect(extraction.timelineMonths.value).toBe(2);
  });

  it("scores and recommends visit when urgency and score are high", () => {
    const messages = [
      inbound("m1", "Urgente: necesito casa en Recoleta, presupuesto USD 500k, cierre asap."),
      inbound("m2", "Tengo preaprobado el crédito y puedo visitar esta semana.")
    ];

    const extraction = runLeadExtraction(messages);
    const assessment = runScoring(extraction, messages, { urgencyThreshold: 70, matchingMode: "AGRESIVO" });
    const action = recommendNextAction(extraction, assessment, {
      matchingMode: "AGRESIVO",
      outreachTone: "Directo y profesional"
    });

    expect(assessment.leadScore).toBeGreaterThan(60);
    expect(assessment.urgency).toBe("high");
    expect(["book_visit", "propose_listings"]).toContain(action.type);
    expect(action.detail).toMatch(/Acción directa:/);
  });

  it("full pipeline returns explainable output with confidence and hooks", async () => {
    const output = await runLeadQualificationPipeline({
      agencyId: "agency_test",
      leadId: "lead_test",
      messages: [
        inbound("m1", "Busco ph en Colegiales, USD 180k, podría mudarme en 6 meses.")
      ],
      policy: {
        urgencyThreshold: 75,
        matchingMode: "CONSERVADOR",
        outreachTone: "Sofisticado y reservado"
      }
    });

    expect(output.version).toBeTruthy();
    expect(["rules_only", "llm_assisted"]).toContain(output.extractionStrategy);
    expect(output.assessment.leadScore).toBeGreaterThanOrEqual(0);
    expect(output.assessment.recommendedNextAction.title.length).toBeGreaterThan(0);
    expect(output.confidence.overall).toBeGreaterThanOrEqual(0);
    expect(output.evaluationHooks.eventName).toBe("qualification.updated");
    expect(output.logs.length).toBeGreaterThan(0);
  });
});
