import { RecommendationUseCase } from "@prisma/client";
import { db } from "@/lib/server/db";

export type PropertyInput = {
  title: string;
  neighborhood: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  useCase: RecommendationUseCase;
  appreciationNote: string | null;
};

function normalizeCurrency(raw: string): string {
  const t = raw.trim().toUpperCase();
  return t.length === 3 ? t : "USD";
}

function parsePropertyPayload(body: unknown): PropertyInput | { error: string } {
  if (body === null || typeof body !== "object") {
    return { error: "Cuerpo inválido" };
  }
  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const neighborhood = typeof o.neighborhood === "string" ? o.neighborhood.trim() : "";
  const propertyType = typeof o.propertyType === "string" ? o.propertyType.trim() : "";
  const price = typeof o.price === "number" ? o.price : typeof o.price === "string" ? Number(o.price) : NaN;
  const bedrooms = typeof o.bedrooms === "number" ? o.bedrooms : typeof o.bedrooms === "string" ? Number(o.bedrooms) : NaN;
  const bathrooms = typeof o.bathrooms === "number" ? o.bathrooms : typeof o.bathrooms === "string" ? Number(o.bathrooms) : NaN;
  const currency = typeof o.currency === "string" ? normalizeCurrency(o.currency) : "USD";
  const useCaseRaw = typeof o.useCase === "string" ? o.useCase.trim().toUpperCase() : "";
  const appreciationNote =
    o.appreciationNote === null || o.appreciationNote === undefined
      ? null
      : typeof o.appreciationNote === "string"
        ? o.appreciationNote.trim() || null
        : null;

  if (!title) return { error: "El título es obligatorio" };
  if (!neighborhood) return { error: "El barrio / zona es obligatorio" };
  if (!propertyType) return { error: "El tipo de propiedad es obligatorio" };
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
    return { error: "El precio debe ser un número entero ≥ 0" };
  }
  if (!Number.isFinite(bedrooms) || bedrooms < 0 || !Number.isInteger(bedrooms)) {
    return { error: "Los dormitorios deben ser un entero ≥ 0" };
  }
  if (!Number.isFinite(bathrooms) || bathrooms < 0 || !Number.isInteger(bathrooms)) {
    return { error: "Los baños deben ser un entero ≥ 0" };
  }
  const useCase =
    useCaseRaw === "LIVING"
      ? RecommendationUseCase.LIVING
      : useCaseRaw === "INVESTMENT"
        ? RecommendationUseCase.INVESTMENT
        : null;
  if (!useCase) {
    return { error: "El caso de uso debe ser vivienda o inversión" };
  }

  return {
    title,
    neighborhood,
    price,
    currency,
    bedrooms,
    bathrooms,
    propertyType,
    useCase,
    appreciationNote
  };
}

export function parsePropertyPayloadFromRequest(body: unknown): PropertyInput | { error: string } {
  return parsePropertyPayload(body);
}

export async function createAgencyProperty(agencyId: string, input: PropertyInput) {
  return db.property.create({
    data: {
      agencyId,
      title: input.title,
      neighborhood: input.neighborhood,
      price: input.price,
      currency: input.currency,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      propertyType: input.propertyType,
      useCase: input.useCase,
      appreciationNote: input.appreciationNote
    }
  });
}

export async function updateAgencyProperty(agencyId: string, propertyId: string, input: PropertyInput) {
  const existing = await db.property.findFirst({
    where: { id: propertyId, agencyId }
  });
  if (!existing) {
    return { ok: false as const, code: "NOT_FOUND" as const };
  }

  await db.property.update({
    where: { id: propertyId },
    data: {
      title: input.title,
      neighborhood: input.neighborhood,
      price: input.price,
      currency: input.currency,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      propertyType: input.propertyType,
      useCase: input.useCase,
      appreciationNote: input.appreciationNote
    }
  });
  return { ok: true as const };
}

export async function deleteAgencyProperty(agencyId: string, propertyId: string) {
  const existing = await db.property.findFirst({
    where: { id: propertyId, agencyId }
  });
  if (!existing) {
    return { ok: false as const, code: "NOT_FOUND" as const };
  }

  await db.property.delete({ where: { id: propertyId } });
  return { ok: true as const };
}
