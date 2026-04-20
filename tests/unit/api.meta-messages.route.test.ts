import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionContext = vi.fn();
const sendMetaOutboundMessage = vi.fn();
const approveMetaOutboundDraft = vi.fn();
const discardMetaOutboundDraft = vi.fn();

vi.mock("@/lib/server/auth-session", () => ({
  requireSessionContext
}));

vi.mock("@/lib/server/send-meta-outbound", () => ({
  sendMetaOutboundMessage,
  approveMetaOutboundDraft,
  discardMetaOutboundDraft
}));

describe("api /leads/[leadId]/meta-messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST saves draft and returns message id", async () => {
    requireSessionContext.mockResolvedValue({ agencyId: "a1", name: "Agente" });
    sendMetaOutboundMessage.mockResolvedValue({ ok: true, messageId: "m1" });

    const { POST } = await import("@/app/api/leads/[leadId]/meta-messages/route");
    const request = new NextRequest("http://localhost/api/leads/l1/meta-messages", {
      method: "POST",
      body: JSON.stringify({ text: "hola" }),
      headers: { "content-type": "application/json" }
    });

    const res = await POST(request, { params: Promise.resolve({ leadId: "l1" }) });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; messageId: string };
    expect(json.ok).toBe(true);
    expect(json.messageId).toBe("m1");
  });

  it("PATCH approve validates action and messageId", async () => {
    requireSessionContext.mockResolvedValue({ agencyId: "a1", name: "Agente" });
    approveMetaOutboundDraft.mockResolvedValue({ ok: true, messageId: "m2" });

    const { PATCH } = await import("@/app/api/leads/[leadId]/meta-messages/route");

    const badRequest = new NextRequest("http://localhost/api/leads/l1/meta-messages", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
      headers: { "content-type": "application/json" }
    });
    const badRes = await PATCH(badRequest, { params: Promise.resolve({ leadId: "l1" }) });
    expect(badRes.status).toBe(400);

    const okRequest = new NextRequest("http://localhost/api/leads/l1/meta-messages", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve", messageId: "m2" }),
      headers: { "content-type": "application/json" }
    });
    const okRes = await PATCH(okRequest, { params: Promise.resolve({ leadId: "l1" }) });
    expect(okRes.status).toBe(200);
    const json = (await okRes.json()) as { ok: boolean; messageId: string };
    expect(json.ok).toBe(true);
    expect(json.messageId).toBe("m2");
  });

  it("PATCH discard path returns ok", async () => {
    requireSessionContext.mockResolvedValue({ agencyId: "a1", name: "Agente" });
    discardMetaOutboundDraft.mockResolvedValue({ ok: true });

    const { PATCH } = await import("@/app/api/leads/[leadId]/meta-messages/route");
    const request = new NextRequest("http://localhost/api/leads/l1/meta-messages", {
      method: "PATCH",
      body: JSON.stringify({ action: "discard", messageId: "m3" }),
      headers: { "content-type": "application/json" }
    });

    const res = await PATCH(request, { params: Promise.resolve({ leadId: "l1" }) });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
