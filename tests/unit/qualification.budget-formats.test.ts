import { describe, expect, it } from "vitest";
import { runLeadExtraction } from "@/lib/qualification/extractors";
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

describe("budget extractor formats", () => {
  it("extracts USD range with k suffix", () => {
    const extraction = runLeadExtraction([inbound("m1", "Presupuesto USD 240k - 280k en Palermo")]);
    expect(extraction.budget.value).toEqual({
      min: 240000,
      max: 280000,
      currency: "USD"
    });
  });

  it("extracts ARS range with local separators", () => {
    const extraction = runLeadExtraction([inbound("m1", "Estoy entre ARS 180.000.000 y 240.000.000")]);
    expect(extraction.budget.value).toEqual({
      min: 180000000,
      max: 240000000,
      currency: "ARS"
    });
  });

  it("extracts USD single value written as millions", () => {
    const extraction = runLeadExtraction([inbound("m1", "Mi tope es U$S 1.2M")]);
    expect(extraction.budget.value).toEqual({
      min: 1200000,
      max: 1200000,
      currency: "USD"
    });
  });

  it("falls back to ARS when only $ is present without explicit usd hint", () => {
    const extraction = runLeadExtraction([inbound("m1", "Podemos pagar $ 220.000.000 contado")]);
    expect(extraction.budget.value?.currency).toBe("ARS");
    expect(extraction.budget.value?.min).toBe(220000000);
  });
});
