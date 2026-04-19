import { NextRequest, NextResponse } from "next/server";
import { ingestLeadAndQualify } from "@/lib/server/lead-intake";
import { sampleInboundConversation } from "@/lib/qualification";

function shiftHours(isoDate: string, deltaHours: number): string {
  const shifted = new Date(new Date(isoDate).getTime() + deltaHours * 60 * 60 * 1000);
  return shifted.toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const agencyId: string = body.agencyId ?? "agency_demo_001";

  const datasets = [
    {
      sourceChannel: "WHATSAPP" as const,
      sourceCampaign: "Meta Ads | Palermo",
      assignedAgentEmail: "lucia@agency.com",
      contactName: "Camila Torres",
      messages: sampleInboundConversation.messages
    },
    {
      sourceChannel: "INSTAGRAM" as const,
      sourceCampaign: "Reels orgánico",
      assignedAgentEmail: "santiago@agency.com",
      contactName: "Matías Roldán",
      messages: [
        {
          id: "ig-1",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -22),
          body: "Necesito 2 ambientes en Caballito, presupuesto USD 170k a 240k. El crédito aún en trámite."
        },
        {
          id: "ig-2",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[1].sentAt, -21),
          body: "El plazo es apretado, ideal en 1 mes. Me preocupan las expensas mensuales."
        }
      ]
    },
    {
      sourceChannel: "WEB_FORM" as const,
      sourceCampaign: "Google Search | Almagro",
      assignedAgentEmail: "valentina@agency.com",
      contactName: "Rocío Benítez",
      messages: [
        {
          id: "web-1",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -72),
          body: "Estamos viendo departamentos en Almagro para el año que viene, 1 dormitorio alrededor de USD 120k a 155k."
        }
      ]
    }
  ];

  const created = [];
  for (const dataset of datasets) {
    const result = await ingestLeadAndQualify({
      agencyId,
      sourceChannel: dataset.sourceChannel,
      sourceCampaign: dataset.sourceCampaign,
      assignedAgentEmail: dataset.assignedAgentEmail,
      contactName: dataset.contactName,
      messages: dataset.messages
    });
    created.push(result);
  }

  return NextResponse.json({ ok: true, createdCount: created.length, created }, { status: 201 });
}
