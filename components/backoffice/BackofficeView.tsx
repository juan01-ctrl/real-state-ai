import { LeadSignalFooter } from "@/components/layout/LeadSignalFooter";
import { LeadSignalSidebar } from "@/components/layout/LeadSignalSidebar";
import { LeadSignalTopBar } from "@/components/layout/LeadSignalTopBar";

interface BackofficeViewProps {
  model: {
    subscription: {
      id: string;
      planCode: string;
      status: string;
      seatLimit: number;
      monthlyPriceUsd: number;
      currentPeriodEnd: string | null;
      updatedAt: string;
    };
    queue: {
      summary: Record<string, number>;
      jobs: Array<{
        id: string;
        type: string;
        status: string;
        attemptCount: number;
        maxAttempts: number;
        nextAttemptAt: string;
        lastRunAt: string | null;
        lastError: string | null;
      }>;
    };
    audit: Array<{
      id: string;
      action: string;
      resource: string;
      summary: string | null;
      createdAt: string;
    }>;
  };
  slo: {
    totalRequests: number;
    successRatePct: number;
    errorRatePct: number;
    p95LatencyMs: number;
  };
}

export function BackofficeView({ model, slo }: BackofficeViewProps) {
  return (
    <main className="leadsignal-page min-h-screen bg-[#fbf9f6] text-[#313330] antialiased">
      <LeadSignalSidebar active="Backoffice" />
      <div className="min-h-screen lg:ml-64">
        <LeadSignalTopBar />

        <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-8 lg:px-16">
          <header className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Gobernanza</span>
            <h2 className="text-4xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
              Backoffice Operativo
            </h2>
            <p className="text-sm text-[#5e5f5c]">Auditoría, plan multitenant, cola crítica y SLO del sistema.</p>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <article className="rounded-lg border border-[#e9e8e4] bg-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#58624e]">Requests 24h</p>
              <p className="mt-2 text-2xl">{slo.totalRequests}</p>
            </article>
            <article className="rounded-lg border border-[#e9e8e4] bg-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#58624e]">Success rate</p>
              <p className="mt-2 text-2xl">{slo.successRatePct}%</p>
            </article>
            <article className="rounded-lg border border-[#e9e8e4] bg-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#58624e]">Error rate</p>
              <p className="mt-2 text-2xl">{slo.errorRatePct}%</p>
            </article>
            <article className="rounded-lg border border-[#e9e8e4] bg-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#58624e]">P95 latencia</p>
              <p className="mt-2 text-2xl">{slo.p95LatencyMs}ms</p>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-[#e9e8e4] bg-white p-6">
              <h3 className="text-xl" style={{ fontFamily: "'Noto Serif', serif" }}>
                Plan y facturación
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-[#5e5f5c]">
                <li>Plan: {model.subscription.planCode}</li>
                <li>Estado: {model.subscription.status}</li>
                <li>Límite de asientos: {model.subscription.seatLimit}</li>
                <li>Precio mensual: USD {model.subscription.monthlyPriceUsd}</li>
                <li>
                  Próximo corte:{" "}
                  {model.subscription.currentPeriodEnd
                    ? new Date(model.subscription.currentPeriodEnd).toLocaleDateString("es-AR")
                    : "No definido"}
                </li>
              </ul>
            </article>

            <article className="rounded-lg border border-[#e9e8e4] bg-white p-6">
              <h3 className="text-xl" style={{ fontFamily: "'Noto Serif', serif" }}>
                Cola crítica
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-[#5e5f5c]">
                {Object.entries(model.queue.summary).map(([status, count]) => (
                  <li key={status}>
                    {status}: {count}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="rounded-lg border border-[#e9e8e4] bg-white p-6">
            <h3 className="text-xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Últimos jobs
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#5e5f5c]">
                  <tr>
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4">Estado</th>
                    <th className="pb-2 pr-4">Intentos</th>
                    <th className="pb-2 pr-4">Próximo intento</th>
                    <th className="pb-2 pr-4">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {model.queue.jobs.map((job) => (
                    <tr className="border-t border-[#f0efea]" key={job.id}>
                      <td className="py-2 pr-4">{job.type}</td>
                      <td className="py-2 pr-4">{job.status}</td>
                      <td className="py-2 pr-4">
                        {job.attemptCount}/{job.maxAttempts}
                      </td>
                      <td className="py-2 pr-4">{new Date(job.nextAttemptAt).toLocaleString("es-AR")}</td>
                      <td className="py-2 pr-4 text-[#a73b21]">{job.lastError ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[#e9e8e4] bg-white p-6">
            <h3 className="text-xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Auditoría reciente
            </h3>
            <ul className="mt-4 space-y-3">
              {model.audit.map((item) => (
                <li className="border-b border-[#f0efea] pb-3 text-sm" key={item.id}>
                  <p className="font-medium text-[#313330]">{item.summary ?? item.action}</p>
                  <p className="text-[#5e5f5c]">
                    {item.resource} · {new Date(item.createdAt).toLocaleString("es-AR")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <LeadSignalFooter variant="atelier" />
      </div>
    </main>
  );
}
