import { createHmac } from "crypto";
import { expect, test } from "@playwright/test";
import { db } from "@/lib/server/db";

const e2eEmail = process.env.E2E_USER_EMAIL?.trim();
const e2ePassword = process.env.E2E_USER_PASSWORD?.trim();
const metaPhoneNumberId = process.env.E2E_META_PHONE_NUMBER_ID?.trim();
const metaAccessToken = process.env.E2E_META_ACCESS_TOKEN?.trim();
const metaRecipientDigits = process.env.E2E_META_TO_DIGITS?.replace(/\D/g, "").trim();
const hasAuth = Boolean(e2eEmail && e2ePassword);
const hasMeta = Boolean(metaPhoneNumberId && metaAccessToken && metaRecipientDigits);

function signatureFor(body: string) {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret) return undefined;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${digest}`;
}

test.describe("meta messaging workflow (ui + api)", () => {
  test.skip(!hasAuth, "Configurá E2E_USER_EMAIL y E2E_USER_PASSWORD.");
  test.skip(!hasMeta, "Configurá E2E_META_PHONE_NUMBER_ID, E2E_META_ACCESS_TOKEN y E2E_META_TO_DIGITS.");

  test("draft -> approve -> webhook read updates ui", async ({ page, request }) => {
    test.setTimeout(180_000);

    await page.goto("/sign-in");
    await page.locator('input[type="email"]').fill(e2eEmail!);
    await page.locator('input[type="password"]').fill(e2ePassword!);
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForURL(/\/leads/, { timeout: 30_000 });

    // 1) Ensure Meta connection in current tenant.
    const connRes = await page.request.post("/api/channels/meta", {
      data: {
        type: "WHATSAPP",
        label: "WhatsApp E2E",
        externalAccountId: metaPhoneNumberId,
        accessToken: metaAccessToken
      }
    });
    expect(connRes.ok()).toBeTruthy();
    const connJson = (await connRes.json()) as { ok?: boolean; connection?: { id?: string } };
    expect(connJson.ok).toBe(true);
    const channelConnectionId = connJson.connection?.id;
    expect(channelConnectionId).toBeTruthy();

    // 2) Intake lead linked to same Meta thread.
    const contact = `E2E Meta ${Date.now()}`;
    const intakeRes = await page.request.post("/api/leads/intake", {
      data: {
        sourceChannel: "WHATSAPP",
        contactName: contact,
        channelConnectionId,
        externalThreadId: `wa:${metaRecipientDigits}`,
        messages: [
          {
            id: `e2e-meta-in-${Date.now()}`,
            body: "Hola, quiero coordinar visita para esta semana.",
            direction: "inbound",
            sentAt: new Date().toISOString(),
            channel: "WHATSAPP"
          }
        ]
      }
    });
    expect(intakeRes.ok()).toBeTruthy();
    const intakeJson = (await intakeRes.json()) as { ok?: boolean; result?: { leadId?: string } };
    expect(intakeJson.ok).toBe(true);
    const leadId = intakeJson.result?.leadId;
    expect(leadId).toBeTruthy();

    // 3) Open lead detail, create draft, approve it.
    await page.goto(`/leads/${leadId}`);
    await expect(page.getByText(contact, { exact: true })).toBeVisible({ timeout: 20_000 });

    const composer = page.getByPlaceholder(/Escribí el mensaje al contacto/i);
    await composer.fill(`Mensaje E2E de aprobación ${Date.now()}`);
    await page.getByRole("button", { name: /Guardar borrador/i }).click();
    await expect(page.getByText(/Borradores pendientes/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Aprobar y enviar/i }).first().click();
    await expect(page.getByText(/Último estado:\s*Entregado/i)).toBeVisible({ timeout: 30_000 });

    // 4) Simulate webhook status = read using stored externalMessageId.
    const approvedMessage = await db.message.findFirst({
      where: {
        direction: "OUTBOUND",
        approvalStatus: "APPROVED",
        conversation: { leadId: leadId! }
      },
      orderBy: { sentAt: "desc" },
      select: { externalMessageId: true }
    });
    expect(approvedMessage?.externalMessageId).toBeTruthy();

    const webhookBody = {
      object: "whatsapp_business_account",
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: metaPhoneNumberId },
                statuses: [{ id: approvedMessage!.externalMessageId, status: "read" }]
              }
            }
          ]
        }
      ]
    };
    const raw = JSON.stringify(webhookBody);
    const sig = signatureFor(raw);

    const webhookRes = await request.post("/api/webhooks/meta", {
      data: webhookBody,
      headers: sig ? { "x-hub-signature-256": sig } : undefined
    });
    expect(webhookRes.ok()).toBeTruthy();
    const webhookJson = (await webhookRes.json()) as { ok?: boolean; errors?: string[] };
    expect(webhookJson.ok).toBe(true);
    expect(webhookJson.errors ?? []).toEqual([]);

    const afterWebhook = await db.message.findFirst({
      where: { externalMessageId: approvedMessage!.externalMessageId },
      select: { deliveryStatus: true }
    });
    expect(afterWebhook?.deliveryStatus).toBe("READ");

    await page.reload();
    await expect(page.getByText(/Último estado:\s*(Leído|Entregado)/i)).toBeVisible({ timeout: 20_000 });
  });
});
