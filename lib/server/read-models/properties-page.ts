import { cache } from "react";
import { db } from "@/lib/server/db";
import { displayUseCase } from "@/lib/i18n/present";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-AR")}`;
  }
}

export interface PropertyCardModel {
  id: string;
  title: string;
  zone: string;
  price: string;
  scoreLabel: string;
  imageUrl: string | null;
  imageAlt: string;
  details: [string, string, string];
  icons: [string, string, string];
  /** Valores crudos para formularios de edición */
  priceValue: number;
  currencyCode: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  useCase: string;
  appreciationNote: string | null;
}

export interface PropertiesPageModel {
  properties: PropertyCardModel[];
  inventoryHeadline: string;
  inventoryDetail: string;
  advisorSummary: string | null;
  relatedRows: { label: string; value: string }[];
}

export const getPropertiesPageModel = cache(async (agencyId: string): Promise<PropertiesPageModel> => {
  const [rows, recAgg] = await Promise.all([
    db.property.findMany({
      where: { agencyId },
      orderBy: [{ updatedAt: "desc" }],
      take: 40
    }),
    db.propertyRecommendation.groupBy({
      by: ["propertyId"],
      where: { property: { agencyId } },
      _count: { _all: true },
      _avg: { fitScore: true }
    })
  ]);

  const recByProperty = new Map<string, { count: number; avgFit: number | null }>();
  for (const r of recAgg) {
    recByProperty.set(r.propertyId, {
      count: r._count._all,
      avgFit: r._avg.fitScore
    });
  }

  const properties: PropertyCardModel[] = rows.map((p) => {
    const rec = recByProperty.get(p.id);
    const fitPct = rec?.avgFit != null ? Math.round(rec.avgFit * 100) : null;
    const scoreLabel = fitPct != null ? `${fitPct}%` : "—";

    const details: [string, string, string] = [
      `${p.bedrooms} dorm.`,
      `${p.bathrooms} baños`,
      displayUseCase(p.useCase)
    ];
    const icons: [string, string, string] = ["bed", "bathtub", "category"];

    return {
      id: p.id,
      title: p.title,
      zone: p.neighborhood,
      price: formatMoney(p.price, p.currency),
      scoreLabel,
      imageUrl: null,
      imageAlt: `${p.title}, ${p.neighborhood}`,
      details,
      icons,
      priceValue: p.price,
      currencyCode: p.currency,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      propertyType: p.propertyType,
      useCase: p.useCase,
      appreciationNote: p.appreciationNote
    };
  });

  const total = rows.length;
  const inventoryHeadline =
    total === 0 ? "Todavía no cargaste propiedades en el inventario." : `Inventario: ${total} propiedad${total === 1 ? "" : "es"}.`;

  const inventoryDetail =
    total === 0
      ? "Agregá propiedades para que las recomendaciones usen datos reales de tu agencia."
      : "Listado según tu base; el score de match promedia los fitScore de recomendaciones históricas por propiedad.";

  const topNote = rows[0]?.appreciationNote?.trim();
  const advisorSummary = topNote
    ? topNote.length > 320
      ? `${topNote.slice(0, 317)}…`
      : topNote
    : total > 0
      ? "Las recomendaciones del motor usan zona, precio, dormitorios y caso de uso declarados en cada ficha."
      : null;

  const relatedRows = [
    { label: "Propiedades en inventario", value: String(total) },
    {
      label: "Recomendaciones vinculadas",
      value: String(recAgg.reduce((s, r) => s + r._count._all, 0))
    }
  ];

  return {
    properties,
    inventoryHeadline,
    inventoryDetail,
    advisorSummary,
    relatedRows
  };
});
