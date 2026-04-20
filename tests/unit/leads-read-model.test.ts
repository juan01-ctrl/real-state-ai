import { describe, expect, it } from "vitest";
import { parseNextAction } from "@/lib/server/read-models/leads";

describe("lead read-model helpers", () => {
  it("parses next action payload when present", () => {
    const out = parseNextAction({
      assessment: {
        recommendedNextAction: {
          type: "book_visit",
          title: "Proponer visita",
          detail: "Enviar dos horarios disponibles"
        }
      }
    });

    expect(out).toBeTruthy();
    expect(out?.type).toBe("book_visit");
    expect(out?.title.length).toBeGreaterThan(0);
  });

  it("returns null for invalid payloads", () => {
    expect(parseNextAction(null)).toBeNull();
    expect(parseNextAction({})).toBeNull();
    expect(parseNextAction({ assessment: {} })).toBeNull();
  });
});
