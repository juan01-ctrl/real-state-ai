import { redirect } from "next/navigation";
import { BackofficeView } from "@/components/backoffice/BackofficeView";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { getBackofficeModel } from "@/lib/server/read-models/backoffice";

export default async function BackofficePage() {
  let agencyId = "";
  try {
    ({ agencyId } = await requirePermission("backoffice.read", { redirectTo: "/sign-in" }));
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      redirect("/dashboard");
    }
    throw error;
  }
  const model = await getBackofficeModel(agencyId);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db.analyticsEvent.findMany({
    where: { agencyId, type: "api.request", occurredAt: { gte: since } },
    take: 3000,
    orderBy: { occurredAt: "desc" }
  });

  const parsed = rows
    .map((row) => row.properties as { statusCode?: number; latencyMs?: number; ok?: boolean })
    .filter((item) => typeof item.statusCode === "number" && typeof item.latencyMs === "number");
  const total = parsed.length;
  const success = parsed.filter((item) => item.ok !== false && (item.statusCode ?? 500) < 500).length;
  const latencies = parsed.map((item) => item.latencyMs ?? 0).sort((a, b) => a - b);
  const p95 =
    latencies.length === 0
      ? 0
      : latencies[Math.min(latencies.length - 1, Math.max(0, Math.floor(latencies.length * 0.95)))];

  return (
    <BackofficeView
      model={model}
      slo={{
        totalRequests: total,
        successRatePct: total === 0 ? 100 : Number(((success / total) * 100).toFixed(2)),
        errorRatePct: total === 0 ? 0 : Number((((total - success) / total) * 100).toFixed(2)),
        p95LatencyMs: Math.round(p95)
      }}
    />
  );
}
