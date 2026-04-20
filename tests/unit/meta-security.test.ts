import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  decryptMetaAccessToken,
  encryptMetaAccessToken,
  isMetaEncryptionConfigured
} from "@/lib/server/meta-token-crypto";
import { verifyMetaWebhookSignature } from "@/lib/server/meta-signature";

describe("meta security helpers", () => {
  const previous = process.env.META_TOKEN_ENCRYPTION_KEY;

  afterEach(() => {
    process.env.META_TOKEN_ENCRYPTION_KEY = previous;
  });

  it("encrypts and decrypts token using configured key", () => {
    process.env.META_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
    const plain = "EAABsbCS1iHgBABtest-token";
    const enc = encryptMetaAccessToken(plain);
    expect(enc).not.toBe(plain);
    expect(decryptMetaAccessToken(enc)).toBe(plain);
    expect(isMetaEncryptionConfigured()).toBe(true);
  });

  it("fails when key is missing or malformed", () => {
    process.env.META_TOKEN_ENCRYPTION_KEY = "";
    expect(isMetaEncryptionConfigured()).toBe(false);

    process.env.META_TOKEN_ENCRYPTION_KEY = Buffer.alloc(16).toString("base64");
    expect(() => encryptMetaAccessToken("x")).toThrow(/32 bytes/i);
  });

  it("validates webhook signature with timing-safe compare", () => {
    const body = JSON.stringify({ hello: "meta" });
    const secret = "app-secret-test";
    const valid = `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;

    expect(verifyMetaWebhookSignature(body, valid, secret)).toBe(true);
    expect(verifyMetaWebhookSignature(body, "sha256=deadbeef", secret)).toBe(false);
    expect(verifyMetaWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyMetaWebhookSignature(body, "invalid", secret)).toBe(false);
  });
});
