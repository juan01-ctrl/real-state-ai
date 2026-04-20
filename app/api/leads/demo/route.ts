import { NextRequest, NextResponse } from "next/server";
import { ingestLeadAndQualify } from "@/lib/server/lead-intake";
import { sampleInboundConversation } from "@/lib/qualification";
import { requireSessionContext } from "@/lib/server/auth-session";

function shiftHours(isoDate: string, deltaHours: number): string {
  const shifted = new Date(new Date(isoDate).getTime() + deltaHours * 60 * 60 * 1000);
  return shifted.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    await request.json().catch(() => ({}));

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
    },
    {
      sourceChannel: "WHATSAPP" as const,
      sourceCampaign: "Referido | Family Office",
      assignedAgentEmail: "lucia@agency.com",
      contactName: "Valeria Di Rossy",
      messages: [
        {
          id: "w-vdr-1",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -6),
          body: "Busco penthouse de 3-4 dormitorios en Palermo Chico o Recoleta. Presupuesto USD 1.8M a 2.6M."
        },
        {
          id: "w-vdr-2",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[1].sentAt, -5),
          body: "Necesito resolver en 30 días. Priorizo terraza privada y seguridad 24h."
        }
      ]
    },
    {
      sourceChannel: "INSTAGRAM" as const,
      sourceCampaign: "Story Ads | Premium Collection",
      assignedAgentEmail: "santiago@agency.com",
      contactName: "Marcus Thorne",
      messages: [
        {
          id: "ig-mt-1",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -10),
          body: "Interesado en casa moderna en zona norte, rango USD 700k a 1.2M. ¿Tienen opciones con jardín grande?"
        },
        {
          id: "ig-mt-2",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -9),
          body: "Viajamos en dos semanas, quiero coordinar visitas antes de esa fecha."
        }
      ]
    },
    {
      sourceChannel: "WEB_FORM" as const,
      sourceCampaign: "Portal | Caballito",
      assignedAgentEmail: "valentina@agency.com",
      contactName: "Elena Rodríguez",
      messages: [
        {
          id: "web-er-1",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -30),
          body: "Estoy buscando depto de 2 ambientes en Caballito. Presupuesto USD 180k a 240k."
        },
        {
          id: "web-er-2",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -28),
          body: "Tengo aprobación bancaria parcial, necesito definir en 45 días."
        }
      ]
    },
    {
      sourceChannel: "WHATSAPP" as const,
      sourceCampaign: "Google Search | Núñez",
      assignedAgentEmail: "lucia@agency.com",
      contactName: "William Chen",
      messages: [
        {
          id: "w-wc-1",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -16),
          body: "Quiero invertir en unidades de 1 dormitorio para renta en Núñez, ticket hasta USD 165k por unidad."
        },
        {
          id: "w-wc-2",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -15),
          body: "Busco cerrar 2 operaciones este trimestre si el rendimiento proyectado supera 5.5% anual."
        }
      ]
    },
    {
      sourceChannel: "INSTAGRAM" as const,
      sourceCampaign: "Organic Reel | Waterfront",
      assignedAgentEmail: "santiago@agency.com",
      contactName: "Julianne Vance",
      messages: [
        {
          id: "ig-jv-1",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -3),
          body: "Vi su publicación del penthouse con vista al río. Busco algo similar, presupuesto USD 900k a 1.4M."
        },
        {
          id: "ig-jv-2",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -2),
          body: "Si está disponible esta semana, puedo visitar jueves o viernes."
        }
      ]
    },
    {
      sourceChannel: "WEB_FORM" as const,
      sourceCampaign: "SEO | Belgrano R",
      assignedAgentEmail: "valentina@agency.com",
      contactName: "Sofía Rinaldi",
      messages: [
        {
          id: "web-sr-1",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -96),
          body: "Busco casa familiar en Belgrano R, 3 dormitorios mínimo, hasta USD 1.1M."
        }
      ]
    },
    {
      sourceChannel: "WHATSAPP" as const,
      sourceCampaign: "Referido | Cliente actual",
      assignedAgentEmail: "lucia@agency.com",
      contactName: "Tomás Legrand",
      messages: [
        {
          id: "w-tl-1",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -12),
          body: "Estoy vendiendo y comprando al mismo tiempo, necesito coordinación rápida. Rango USD 500k a 680k."
        },
        {
          id: "w-tl-2",
          direction: "inbound" as const,
          channel: "WHATSAPP" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -11),
          body: "Prioridad total: cercanía a colegios y cochera doble."
        }
      ]
    },
    {
      sourceChannel: "INSTAGRAM" as const,
      sourceCampaign: "Performance | Investors",
      assignedAgentEmail: "santiago@agency.com",
      contactName: "Adriana Costa",
      messages: [
        {
          id: "ig-ac-1",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -40),
          body: "Evaluando inversión en pozo en Palermo Hollywood. Ticket USD 130k a 190k."
        },
        {
          id: "ig-ac-2",
          direction: "inbound" as const,
          channel: "INSTAGRAM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -39),
          body: "Necesito comparar entrega estimada, expensas y administración."
        }
      ]
    },
    {
      sourceChannel: "WEB_FORM" as const,
      sourceCampaign: "Google Search | Urgent Move",
      assignedAgentEmail: "valentina@agency.com",
      contactName: "Federico Navas",
      messages: [
        {
          id: "web-fn-1",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[0].sentAt, -5),
          body: "Necesito mudarme en menos de 3 semanas por relocalización laboral. Presupuesto USD 260k a 340k."
        },
        {
          id: "web-fn-2",
          direction: "inbound" as const,
          channel: "WEB_FORM" as const,
          sentAt: shiftHours(sampleInboundConversation.messages[2].sentAt, -4),
          body: "Puedo firmar reserva esta misma semana si encuentro opción lista para ocupar."
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
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sesión inválida o expirada"
          }
        },
        { status: 401 }
      );
    }

    const message = error instanceof Error ? error.message : "Error al generar leads demo";
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DEMO_GENERATION_FAILED",
          message
        }
      },
      { status: 400 }
    );
  }
}
