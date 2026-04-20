import { test, expect } from "@playwright/test";

const e2eEmail = process.env.E2E_USER_EMAIL?.trim();
const e2ePassword = process.env.E2E_USER_PASSWORD?.trim();
const hasAuth = Boolean(e2eEmail && e2ePassword);

test.describe("marketing", () => {
  test("landing carga con copy principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/inmobiliar/i).first()).toBeVisible();
  });
});

test.describe("journey lead (navegador + API)", () => {
  test.skip(!hasAuth, "Configurá E2E_USER_EMAIL y E2E_USER_PASSWORD (usuario real en la DB).");

  test("sesión → intake → lead visible en bandeja", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/sign-in");
    await page.locator('input[type="email"]').fill(e2eEmail!);
    await page.locator('input[type="password"]').fill(e2ePassword!);
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForURL(/\/leads/, { timeout: 30_000 });

    const contact = `E2E ${Date.now()}`;
    const res = await page.request.post("/api/leads/intake", {
      data: {
        sourceChannel: "WEB_FORM",
        contactName: contact,
        messages: [
          {
            id: "e2e1",
            body: "Hola, busco casa en CABA, presupuesto 300000 USD, urgente.",
            direction: "inbound",
            sentAt: new Date().toISOString(),
            channel: "WEB_FORM"
          }
        ]
      }
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);

    await page.goto("/leads");
    await expect(page.getByText(contact, { exact: true })).toBeVisible({ timeout: 60_000 });
  });
});
