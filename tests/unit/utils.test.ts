import { describe, expect, it } from "vitest";
import { displayDeliveryStatus } from "@/lib/i18n/present";
import { getPublicAppOrigin } from "@/lib/server/public-app-url";
import { stableHash } from "@/lib/server/hash";

describe("utility helpers", () => {
  it("builds public app origin from envs", () => {
    const prevPublic = process.env.NEXT_PUBLIC_APP_URL;
    const prevAuth = process.env.BETTER_AUTH_URL;
    const prevVercel = process.env.VERCEL_URL;

    process.env.NEXT_PUBLIC_APP_URL = "";
    process.env.BETTER_AUTH_URL = "";
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getPublicAppOrigin()).toBe("https://my-app.vercel.app");

    process.env.NEXT_PUBLIC_APP_URL = "https://custom.app/";
    expect(getPublicAppOrigin()).toBe("https://custom.app");

    process.env.NEXT_PUBLIC_APP_URL = prevPublic;
    process.env.BETTER_AUTH_URL = prevAuth;
    process.env.VERCEL_URL = prevVercel;
  });

  it("stableHash is deterministic for same payload", () => {
    const a = { x: 1, y: [1, 2, 3] };
    const h1 = stableHash(a);
    const h2 = stableHash(a);
    expect(h1).toBe(h2);
  });

  it("maps delivery labels including NOT_SENT", () => {
    expect(displayDeliveryStatus("NOT_SENT")).toMatch(/No enviado/i);
    expect(displayDeliveryStatus("READ")).toMatch(/Leído/i);
    expect(displayDeliveryStatus("FAILED")).toMatch(/Fallido/i);
  });
});
