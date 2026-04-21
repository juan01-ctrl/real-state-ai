import Link from "next/link";
import { TaskType } from "@prisma/client";
import { LeadSignalSidebar } from "@/components/layout/LeadSignalSidebar";
import { LeadSignalTopBar } from "@/components/layout/LeadSignalTopBar";
import { LeadSignalFooter } from "@/components/layout/LeadSignalFooter";
import { formatRelativeHours } from "@/lib/formatters";
import type { TeamCommandCenterModel, TeamUrgentItem } from "@/lib/server/read-models/team-command-center";

interface TeamCommandCenterViewProps {
  team: TeamCommandCenterModel;
}

function taskTypeLabel(t: string) {
  const map: Record<string, string> = {
    [TaskType.CALL]: "Llamada",
    [TaskType.FOLLOW_UP_MESSAGE]: "Mensaje",
    [TaskType.VISIT_CONFIRM]: "Visita",
    [TaskType.MANUAL_REVIEW]: "Revisión"
  };
  return map[t] ?? t;
}

function urgentTone(item: TeamUrgentItem): "now" | "today" | "risk" {
  if (item.kind === "stale") return "risk";
  if (item.kind === "followup") return "today";
  if (item.subline.startsWith("Vencida")) return "now";
  return "today";
}

function UrgentCard({ item }: { item: TeamUrgentItem }) {
  const tone = urgentTone(item);
  const border =
    tone === "now"
      ? "border-[#a73b21]/25 bg-white"
      : tone === "risk"
        ? "border-[#686028]/20 bg-[#fafaf8]"
        : "border-[#58624e]/15 bg-white";

  return (
    <article
      className={`group rounded-lg border p-5 shadow-[0_16px_40px_-14px_rgba(49,51,48,0.06)] transition-all hover:border-[#58624e]/25 sm:p-6 ${border}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
            tone === "now" ? "text-[#a73b21]" : tone === "risk" ? "text-[#686028]" : "text-[#58624e]"
          }`}
        >
          {item.kind === "task"
            ? "Tarea"
            : item.kind === "followup"
              ? "Seguimiento"
              : "Riesgo de enfriamiento"}
        </span>
        <span className="material-symbols-outlined text-[20px] text-stone-300">
          {tone === "now" ? "alarm" : tone === "risk" ? "thermostat" : "event"}
        </span>
      </div>
      <h4 className="mb-1 text-lg text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
        {item.fullName}
      </h4>
      <p className="mb-4 text-xs text-stone-500">
        {item.zone}
        {item.ownerLabel ? ` · ${item.ownerLabel}` : ""}
      </p>
      <div className="mb-4 rounded-md bg-[#f5f3f0] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Acción</p>
        <p className="mt-1 text-sm font-medium leading-snug text-[#313330]">{item.headline}</p>
        <p className="mt-1 text-xs text-stone-500">{item.subline}</p>
      </div>
      <Link
        className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#58624e]"
        href={`/leads/${item.leadId}`}
      >
        Abrir lead
        <span className="material-symbols-outlined ml-1 text-[16px]">chevron_right</span>
      </Link>
    </article>
  );
}

function LeadRowLink({
  row,
  showSilence
}: {
  row: { leadId: string; fullName: string; zone: string; score: number; closeProbability: number; silenceHours: number; ownerLabel: string | null; stageLabel: string };
  showSilence?: boolean;
}) {
  return (
    <Link
      className="group flex items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-stone-200 hover:bg-white"
      href={`/leads/${row.leadId}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#313330]">{row.fullName}</p>
        <p className="mt-0.5 truncate text-xs text-stone-500">
          {row.zone} · {row.stageLabel}
          {row.ownerLabel ? ` · ${row.ownerLabel}` : ""}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-0.5 text-right">
        <span className="text-xs tabular-nums text-[#58624e]">{row.closeProbability}%</span>
        {showSilence ? (
          <span className="text-[10px] uppercase tracking-wider text-stone-400">
            {formatRelativeHours(row.silenceHours)} sin actividad
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-stone-400">score {row.score}</span>
        )}
      </div>
      <span className="material-symbols-outlined text-stone-300 transition-colors group-hover:text-[#58624e]">
        chevron_right
      </span>
    </Link>
  );
}

export function TeamCommandCenterView({ team }: TeamCommandCenterViewProps) {
  const {
    snapshotAt,
    headline,
    urgentFollowUps,
    unassignedHighValue,
    atRisk,
    visitsBookedToday,
    workloadByMember,
    openTasksByOwner,
    insightHint
  } =
    team;
  const snapshotAtLabel = new Date(snapshotAt).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const maxLoad = Math.max(1, ...workloadByMember.map((w) => w.activeLeads));

  return (
    <main className="leadsignal-page min-h-screen bg-[#fbf9f6] font-body text-[#313330]">
      <LeadSignalSidebar active="Equipo" />

      <div className="min-h-screen lg:ml-64">
        <LeadSignalTopBar />

        <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <div className="mb-8 rounded-lg border border-[#dce6cd] bg-[#f5f3f0] px-4 py-4 sm:px-6 sm:py-5">
            <p className="text-sm text-[#313330]">
              Para <strong>dar de alta o editar miembros</strong> del equipo (roles, invitaciones), usá{" "}
              <Link className="font-medium text-[#58624e] underline underline-offset-2" href={`/settings#equipo`}>
                Configuración → Equipo activo
              </Link>
              .
            </p>
          </div>

          <header className="mb-10 border-b border-stone-200/80 pb-8 sm:mb-12">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Datos actualizados</p>
            <h1 className="text-2xl text-[#313330] sm:text-3xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Centro de comando comercial
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
              Prioridades reales del pipeline: seguimientos, riesgo, visitas y carga por persona. Todo desde datos de
              la agencia.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-400">{snapshotAtLabel}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Seguimientos urgentes", value: headline.urgentCount },
                { label: "Tareas abiertas", value: headline.openTasks },
                { label: "Visitas agendadas hoy", value: headline.visitsToday },
                { label: "Sin asignar (valor)", value: headline.unassignedHighValue },
                { label: "En riesgo (score+silencio)", value: headline.atRisk }
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-stone-200/60 bg-white px-4 py-3 text-center shadow-[0_8px_24px_-12px_rgba(49,51,48,0.06)]"
                >
                  <p className="text-2xl tabular-nums text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-[9px] font-medium uppercase leading-tight tracking-[0.12em] text-stone-400">
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>
          </header>

          {/* 1. Urgent follow-ups */}
          <section className="mb-14 sm:mb-16">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Seguimientos urgentes</h2>
                <p className="mt-1 text-xs text-stone-400">Tareas vencidas o para hoy, recordatorios del día y leads calientes sin movimiento.</p>
              </div>
              <Link
                className="text-[10px] uppercase tracking-[0.1em] text-stone-400 transition-colors hover:text-[#58624e]"
                href={`/leads`}
              >
                Ir a bandeja
              </Link>
            </div>

            {urgentFollowUps.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {urgentFollowUps.map((item) => (
                  <UrgentCard item={item} key={`${item.kind}-${item.id}`} />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-stone-200 bg-white/80 px-6 py-10 text-center text-sm text-stone-500">
                No hay seguimientos urgentes según tareas, recordatorios y silencio. Revisá la bandeja para leads nuevos.
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            {/* 2 & 3 Unassigned + At risk */}
            <div className="space-y-10">
              <section>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">
                  Leads de alto valor sin responsable
                </h2>
                <p className="mb-4 text-xs text-stone-400">Sin owner, con probabilidad/score/prioridad altos.</p>
                <div className="divide-y divide-stone-100 rounded-lg border border-stone-200/60 bg-white">
                  {unassignedHighValue.length ? (
                    unassignedHighValue.map((row) => (
                      <LeadRowLink key={row.leadId} row={row} showSilence={false} />
                    ))
                  ) : (
                    <p className="px-4 py-8 text-center text-sm text-stone-500">Ninguno en este momento.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Leads en riesgo</h2>
                <p className="mb-4 text-xs text-stone-400">Score ≥ 65 y más de 24h sin actividad (pipeline activo).</p>
                <div className="divide-y divide-stone-100 rounded-lg border border-stone-200/60 bg-white">
                  {atRisk.length ? (
                    atRisk.map((row) => <LeadRowLink key={row.leadId} row={row} showSilence />)
                  ) : (
                    <p className="px-4 py-8 text-center text-sm text-stone-500">No hay señales de riesgo con estos criterios.</p>
                  )}
                </div>
              </section>
            </div>

            {/* 4 Visits today */}
            <section>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">
                Visitas agendadas hoy
              </h2>
              <p className="mb-4 text-xs text-stone-400">Transiciones a «Visita agendada» registradas hoy (historial de etapas).</p>
              <div className="divide-y divide-stone-100 rounded-lg border border-stone-200/60 bg-white">
                {visitsBookedToday.length ? (
                  visitsBookedToday.map((v) => (
                    <Link
                      className="group flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-[#fafaf8]"
                      href={`/leads/${v.leadId}`}
                      key={v.leadId}
                    >
                      <div>
                        <p className="font-medium text-[#313330]">{v.fullName}</p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {v.zone}
                          {v.ownerLabel ? ` · ${v.ownerLabel}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">
                          {new Date(v.bookedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className="material-symbols-outlined text-stone-300 group-hover:text-[#58624e]">
                          chevron_right
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-stone-500">
                    Hoy todavía no se registró ningún pase a visita agendada.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* 5 Workload */}
          <section className="mt-14 border-t border-stone-200/80 pt-12 sm:mt-16">
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">
              Carga por persona
            </h2>
            <p className="mb-6 text-xs text-stone-400">Leads activos asignados (excluye ganados/perdidos).</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workloadByMember.length ? (
                workloadByMember.map((w) => (
                  <div className="rounded-lg border border-stone-200/60 bg-white px-4 py-4" key={w.userId}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#313330]">{w.name}</span>
                      <span className="text-xs tabular-nums text-stone-500">{w.activeLeads} activos</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#efeeea]">
                      <div
                        className="h-full rounded-full bg-[#58624e]/80 transition-all"
                        style={{ width: `${Math.min(100, Math.round((w.activeLeads / maxLoad) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-stone-500">No hay leads asignados o el equipo aún no tiene ownership cargado.</p>
              )}
            </div>
          </section>

          {/* 6 Open tasks by owner */}
          <section className="mt-12 pb-8 sm:mt-14">
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">
              Tareas abiertas por responsable del lead
            </h2>
            <p className="mb-6 text-xs text-stone-400">
              Agrupado por el owner del lead (las tareas heredan la cuenta del negocio).
            </p>
            <div className="grid gap-8 lg:grid-cols-2">
              {openTasksByOwner.some((g) => g.tasks.length > 0) ? (
                openTasksByOwner
                  .filter((g) => g.tasks.length > 0)
                  .map((group) => (
                    <div className="rounded-lg border border-stone-200/60 bg-white p-5" key={group.userId ?? "unassigned"}>
                      <p className="mb-4 text-sm font-medium text-[#313330]">{group.name}</p>
                      <ul className="space-y-3">
                        {group.tasks.map((t) => (
                          <li className="flex flex-col gap-1 border-b border-stone-100 pb-3 last:border-0 last:pb-0" key={t.taskId}>
                            <div className="flex items-start justify-between gap-2">
                              <Link className="text-sm font-medium text-[#313330] hover:text-[#58624e]" href={`/leads/${t.leadId}`}>
                                {t.title}
                              </Link>
                              <span className="flex-shrink-0 text-[9px] uppercase tracking-wider text-stone-400">
                                {taskTypeLabel(t.type)}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500">Lead: {t.leadName}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-stone-500">No hay tareas abiertas en el pipeline.</p>
              )}
            </div>
          </section>

          {insightHint ? (
            <aside className="mt-4 rounded-sm border-l-2 border-[#58624e] bg-white p-6 shadow-[0_12px_32px_-16px_rgba(49,51,48,0.08)]">
              <span className="material-symbols-outlined mb-2 text-sm text-[#58624e]">priority_high</span>
              <p className="text-sm italic leading-relaxed text-stone-600">&quot;{insightHint}&quot;</p>
            </aside>
          ) : null}
        </div>

        <LeadSignalFooter className="mt-16 sm:mt-20" variant="editorial" />
      </div>
    </main>
  );
}
