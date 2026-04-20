import { createHmac, timingSafeEqual } from "crypto";

/**
 * Valida `X-Hub-Signature-256` de Meta (WhatsApp / Instagram) sobre el cuerpo crudo.
 */
export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expectedHex = signatureHeader.slice("sha256=".length).trim();
  const hmacHex = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(hmacHex, "hex"));
  } catch {
    return false;
  }
}
