import { LeadQualificationInput } from "@/lib/qualification/types";

export const sampleInboundConversation: LeadQualificationInput = {
  agencyId: "agency_ba_prime_01",
  leadId: "lead_demo_1001",
  messages: [
    {
      id: "m1",
      direction: "inbound",
      channel: "WHATSAPP",
      sentAt: "2026-04-18T12:02:00Z",
      body: "Hola, buscamos un departamento de 2 dormitorios en Palermo Soho o Colegiales. Presupuesto alrededor de USD 240k a 280k."
    },
    {
      id: "m2",
      direction: "outbound",
      channel: "WHATSAPP",
      sentAt: "2026-04-18T12:05:00Z",
      body: "Perfecto, ¿qué plazo tienen en mente y van por financiación o contado?"
    },
    {
      id: "m3",
      direction: "inbound",
      channel: "WHATSAPP",
      sentAt: "2026-04-18T12:08:00Z",
      body: "Tenemos crédito preaprobado y nos gustaría mudarnos en 2 meses. Lo que más nos preocupa son expensas bajas y cochera."
    }
  ]
};
