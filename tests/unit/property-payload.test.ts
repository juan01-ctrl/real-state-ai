import { describe, expect, it } from "vitest";
import { parsePropertyPayloadFromRequest } from "@/lib/server/property-mutations";

describe("property payload parser", () => {
  it("accepts valid payload and normalizes fields", () => {
    const parsed = parsePropertyPayloadFromRequest({
      title: "Casa moderna",
      neighborhood: "Palermo",
      price: "320000",
      currency: "usd",
      bedrooms: "3",
      bathrooms: 2,
      propertyType: "Casa",
      useCase: "investment",
      appreciationNote: "Muy buena salida"
    });

    if ("error" in parsed) {
      throw new Error(parsed.error);
    }

    expect(parsed.price).toBe(320000);
    expect(parsed.currency).toBe("USD");
    expect(parsed.useCase).toBe("INVESTMENT");
    expect(parsed.bedrooms).toBe(3);
  });

  it("rejects missing and invalid numeric fields", () => {
    const bad1 = parsePropertyPayloadFromRequest({});
    expect("error" in bad1).toBe(true);

    const bad2 = parsePropertyPayloadFromRequest({
      title: "x",
      neighborhood: "x",
      price: -1,
      currency: "usd",
      bedrooms: 1,
      bathrooms: 1,
      propertyType: "x",
      useCase: "LIVING"
    });
    expect("error" in bad2 && /precio/i.test(bad2.error)).toBe(true);
  });

  it("rejects invalid use case", () => {
    const parsed = parsePropertyPayloadFromRequest({
      title: "x",
      neighborhood: "x",
      price: 1,
      currency: "usd",
      bedrooms: 1,
      bathrooms: 1,
      propertyType: "x",
      useCase: "OTHER"
    });
    expect("error" in parsed).toBe(true);
    if ("error" in parsed) {
      expect(parsed.error).toMatch(/caso de uso/i);
    }
  });
});
