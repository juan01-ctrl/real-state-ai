import { cache } from "react";
import { db } from "@/lib/server/db";

export type AiMatchingMode = "CONSERVADOR" | "AGRESIVO";
export type AiOutreachTone =
  | "Sofisticado y reservado"
  | "Directo y profesional"
  | "Cálido y cercano"
  | "Técnico y preciso";

export interface AgencyAiPreferencesModel {
  snapshotAt: string;
  urgencyThreshold: number;
  matchingMode: AiMatchingMode;
  outreachTone: AiOutreachTone;
}

export const getAgencyAiPreferences = cache(async (agencyId: string): Promise<AgencyAiPreferencesModel> => {
  const [agency, nowRows] = await Promise.all([
    db.agency.findUnique({
      where: { id: agencyId },
      select: {
        aiUrgencyThreshold: true,
        aiMatchingMode: true,
        aiOutreachTone: true
      }
    }),
    db.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`
  ]);

  const nowIso = (nowRows[0]?.now ?? new Date()).toISOString();

  return {
    snapshotAt: nowIso,
    urgencyThreshold: Math.max(0, Math.min(100, agency?.aiUrgencyThreshold ?? 75)),
    matchingMode: agency?.aiMatchingMode === "AGRESIVO" ? "AGRESIVO" : "CONSERVADOR",
    outreachTone: (agency?.aiOutreachTone as AiOutreachTone) ?? "Sofisticado y reservado"
  };
});
