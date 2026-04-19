import { ConfidenceReport, ExtractionResult, QualificationLog } from "@/lib/qualification/types";

const CRITICAL_FIELDS: Array<keyof ExtractionResult> = [
  "budget",
  "preferredZones",
  "propertyType",
  "timelineMonths"
];

export function buildConfidenceReport(
  extraction: ExtractionResult,
  logs: QualificationLog[]
): ConfidenceReport {
  const fieldConfidence: Record<string, number> = {
    budget: extraction.budget.confidence,
    preferredZones: extraction.preferredZones.confidence,
    propertyType: extraction.propertyType.confidence,
    bedrooms: extraction.bedrooms.confidence,
    financingMode: extraction.financingMode.confidence,
    timelineMonths: extraction.timelineMonths.confidence,
    objections: extraction.objections.confidence
  };

  const weightedAverage =
    Object.values(fieldConfidence).reduce((sum, value) => sum + value, 0) /
    Object.values(fieldConfidence).length;

  const missingCriticalFields = CRITICAL_FIELDS.filter((field) => {
    const extracted = extraction[field];
    if (Array.isArray(extracted.value)) {
      return extracted.value.length === 0;
    }
    return extracted.value === null || extracted.value === "unknown";
  }).map((field) => field.toString());

  const overall = Math.max(0, weightedAverage - missingCriticalFields.length * 0.12);

  if (missingCriticalFields.length > 0) {
    logs.push({
      timestamp: new Date().toISOString(),
      step: "confidence",
      level: "warn",
      message: "Faltan campos críticos de calificación",
      data: { missingCriticalCount: missingCriticalFields.length }
    });
  }

  return {
    overall,
    fieldConfidence,
    missingCriticalFields,
    requiresHumanReview: overall < 0.62 || missingCriticalFields.length >= 2
  };
}
