import { RecommendationUseCase } from "@prisma/client";
import { db } from "@/lib/server/db";

interface RecommendationInput {
  agencyId: string;
  leadId: string;
  preferredZones: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  bedrooms: number | null;
  propertyType: string;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export async function ensureSeedProperties(agencyId: string) {
  const existingCount = await db.property.count({ where: { agencyId } });
  if (existingCount > 0) {
    return;
  }

  await db.property.createMany({
    data: [
      {
        agencyId,
        title: "2 amb. con balcón en Arevalo",
        neighborhood: "Palermo Soho",
        price: 272000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        useCase: RecommendationUseCase.LIVING,
        appreciationNote: "Microzona premium, demanda estable a largo plazo"
      },
      {
        agencyId,
        title: "Esquina luminosa en Colegiales",
        neighborhood: "Colegiales",
        price: 279000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        useCase: RecommendationUseCase.LIVING,
        appreciationNote: "Baja volatilidad y demanda familiar sólida"
      },
      {
        agencyId,
        title: "Semipiso en Caballito",
        neighborhood: "Caballito",
        price: 235000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        useCase: RecommendationUseCase.LIVING,
        appreciationNote: "Buena velocidad de compradores en esta franja de precio"
      },
      {
        agencyId,
        title: "Unidad moderna en Villa Crespo",
        neighborhood: "Villa Crespo",
        price: 228000,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        useCase: RecommendationUseCase.INVESTMENT,
        appreciationNote: "Rotación de alquiler y precios resilientes"
      },
      {
        agencyId,
        title: "Departamento inicial en Almagro",
        neighborhood: "Almagro",
        price: 149000,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "apartment",
        useCase: RecommendationUseCase.INVESTMENT,
        appreciationNote: "Buen punto de entrada para primera inversión"
      },
      {
        agencyId,
        title: "Departamento renovado en Belgrano R",
        neighborhood: "Belgrano R",
        price: 287000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        useCase: RecommendationUseCase.LIVING,
        appreciationNote: "Manzana premium con baja vacancia"
      }
    ]
  });
}

function scoreProperty(
  property: {
    neighborhood: string;
    price: number;
    bedrooms: number;
    propertyType: string;
  },
  input: RecommendationInput
) {
  let score = 0.4;
  const reasons: string[] = [];

  if (input.preferredZones.some((zone) => property.neighborhood.toLowerCase().includes(zone.toLowerCase()))) {
    score += 0.28;
    reasons.push("Encaja en la zona preferida");
  }

  if (input.budgetMax != null && property.price <= input.budgetMax) {
    score += 0.18;
    reasons.push("Dentro del presupuesto máximo indicado");
  }

  if (input.budgetMin != null && property.price >= input.budgetMin) {
    score += 0.08;
  }

  if (input.bedrooms != null && property.bedrooms === input.bedrooms) {
    score += 0.16;
    reasons.push("Cantidad de dormitorios alineada con el pedido");
  }

  if (input.propertyType !== "unknown" && property.propertyType === input.propertyType) {
    score += 0.1;
  }

  return {
    fitScore: Math.min(0.99, Number(score.toFixed(2))),
    reasons: unique(reasons)
  };
}

export async function createRecommendationsForLead(input: RecommendationInput) {
  await ensureSeedProperties(input.agencyId);

  await db.propertyRecommendation.deleteMany({ where: { leadId: input.leadId } });

  const candidates = await db.property.findMany({
    where: {
      agencyId: input.agencyId
    }
  });

  const ranked = candidates
    .map((property) => {
      const scored = scoreProperty(property, input);
      return {
        property,
        fitScore: scored.fitScore,
        reasons: scored.reasons
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);

  if (!ranked.length) {
    return [];
  }

  const created = [];
  for (let index = 0; index < ranked.length; index += 1) {
    const item = ranked[index];
    const next = ranked[index + 1];

    const recommendation = await db.propertyRecommendation.create({
      data: {
        leadId: input.leadId,
        propertyId: item.property.id,
        rank: index + 1,
        fitScore: item.fitScore,
        reasons: item.reasons.length ? item.reasons : ["Encaje general con el perfil actual"],
        tradeoff:
          next != null
            ? `Frente a #${index + 2}, esta opción es ${
                item.property.price <= next.property.price ? "más accesible en precio" : "más premium"
              }`
            : null,
        strategy: "weighted_zone_budget_bedrooms_v1"
      },
      include: {
        property: true
      }
    });

    created.push(recommendation);
  }

  return created;
}
