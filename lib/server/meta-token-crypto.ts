import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer {
  const raw = process.env.META_TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error("META_TOKEN_ENCRYPTION_KEY no está definido (32 bytes en base64)");
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("META_TOKEN_ENCRYPTION_KEY debe decodificar exactamente 32 bytes (openssl rand -base64 32)");
  }
  return buf;
}

/** Cifra token de acceso de Meta para persistencia en DB. */
export function encryptMetaAccessToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptMetaAccessToken(blob: string): string {
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function isMetaEncryptionConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}
