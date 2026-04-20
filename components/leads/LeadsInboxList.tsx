"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChannelType, LeadStage } from "@prisma/client";
import { LeadInboxItem } from "@/lib/server/read-models/leads";
import { formatCurrencyUSD, formatRelativeHours } from "@/lib/formatters";
import { displayChannel } from "@/lib/i18n/present";

interface LeadsInboxListProps {
  items: LeadInboxItem[];
  selectedLeadId: string | null;
}

const INBOX_TABS = [
  { id: "todos" as const, label: "Todos" },
  { id: "alta" as const, label: "Alta probabilidad" },
  { id: "riesgo" as const, label: "En riesgo" },
  { id: "nuevos" as const, label: "Nuevos hoy" },
  { id: "seguimiento" as const, label: "Esperando seguimiento" }
];

const SOURCE_OPTIONS: ChannelType[] = [
  ChannelType.WHATSAPP,
  ChannelType.INSTAGRAM,
  ChannelType.WEB_FORM,
  ChannelType.PORTAL,
  ChannelType.MANUAL_IMPORT
];

function isCreatedToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Criterios alineados con la tarjeta (probabilidad / silencio / tareas). */
function matchesTab(item: LeadInboxItem, tab: (typeof INBOX_TABS)[number]["id"]): boolean {
  switch (tab) {
    case "todos":
      return true;
    case "alta":
      return item.closeProbability >= 70;
    case "riesgo":
      return item.closeProbability < 60 || (item.silenceHours ?? 0) >= 48;
    case "nuevos":
      return isCreatedToday(item.createdAt);
    case "seguimiento":
      return (
        item.messaging.pendingApprovalCount > 0 ||
        item.messaging.failedCount > 0 ||
        item.hasManualReviewTask ||
        (item.silenceHours ?? 0) >= 24 ||
        ((item.stage === LeadStage.NEW || item.stage === LeadStage.CONTACTED) && (item.silenceHours ?? 0) >= 8)
      );
    default:
      return true;
  }
}

function buildArea(item: LeadInboxItem) {
  return item.preferredZones[0] ?? item.sourceCampaign ?? "Zona sin definir";
}

function buildBudget(item: LeadInboxItem) {
  if (item.budgetMin != null && item.budgetMax != null) {
    return `${formatCurrencyUSD(item.budgetMin)} - ${formatCurrencyUSD(item.budgetMax)}`;
  }

  if (item.budgetMin != null) {
    return `Desde ${formatCurrencyUSD(item.budgetMin)}`;
  }

  if (item.budgetMax != null) {
    return `Hasta ${formatCurrencyUSD(item.budgetMax)}`;
  }

  return "Presupuesto no definido";
}

function buildPriorityLabel(item: LeadInboxItem) {
  if ((item.silenceHours ?? 0) >= 48) {
    return { label: "Reactivar ya", tone: "risk" as const };
  }

  if (item.score >= 85) {
    return { label: "Alta urgencia", tone: "hot" as const };
  }

  return { label: "Media", tone: "mid" as const };
}

function buildLastActive(item: LeadInboxItem) {
  if (item.silenceHours == null) return "Sin actividad registrada";
  if (item.silenceHours < 1) return "Activo ahora";
  return `Última actividad ${formatRelativeHours(item.silenceHours)}`;
}

function buildActionLabel(item: LeadInboxItem) {
  if (item.messaging.failedCount > 0) return "Reenviar";
  if (item.messaging.pendingApprovalCount > 0) return "Aprobar mensaje";
  if ((item.silenceHours ?? 0) >= 48) return "Reactivar";
  if (item.closeProbability >= 85) return "Agendar visita";
  return item.recommendedNextAction?.title ? "Ver acción" : "Definir acción";
}

export function LeadsInboxList({ items, selectedLeadId }: LeadsInboxListProps) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof INBOX_TABS)[number]["id"]>("todos");
  const [source, setSource] = useState<"all" | ChannelType>("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (!matchesTab(item, tab)) return false;
      if (source !== "all" && item.sourceChannel !== source) return false;
      return true;
    });
  }, [items, tab, source]);

  useEffect(() => {
    if (selectedLeadId == null) return;
    const stillVisible = filtered.some((i) => i.id === selectedLeadId);
    if (stillVisible || filtered.length === 0) return;
    router.replace(`/leads?leadId=${filtered[0].id}`);
  }, [tab, source, selectedLeadId, filtered, router]);

  const handleRowClick = (leadId: string) => {
    router.push(`/leads?leadId=${leadId}`);
  };

  return (
    <div className="min-w-0">
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 pb-2 sm:mb-10 sm:gap-6">
        {INBOX_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              className={`pb-1 text-[10px] font-medium uppercase tracking-[0.15em] sm:text-[11px] ${
                active
                  ? "border-b border-[#58624e] text-[#313330]"
                  : "text-stone-400 transition-colors hover:text-[#313330]"
              }`}
              type="button"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
        <label className="flex items-center gap-1 pb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-stone-500 sm:text-[11px]">
          <span className="sr-only">Filtrar por fuente</span>
          <span className="text-stone-400">Fuente</span>
          <select
            className="max-w-[11rem] cursor-pointer border-0 bg-transparent py-0 pl-0 pr-6 text-[10px] font-medium uppercase tracking-[0.15em] text-[#313330] outline-none focus:ring-0 sm:text-[11px]"
            value={source}
            onChange={(e) => {
              const v = e.target.value;
              setSource(v === "all" ? "all" : (v as ChannelType));
            }}
          >
            <option value="all">Todas</option>
            {SOURCE_OPTIONS.map((ch) => (
              <option key={ch} value={ch}>
                {displayChannel(ch)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-200 bg-[#fafaf8] px-4 py-10 text-center text-sm text-stone-500">
          No hay leads que coincidan con este filtro. Probá otra pestaña o cambiá la fuente.
        </p>
      ) : null}

      <div className="space-y-3 sm:space-y-4">
        {filtered.map((item) => {
          const isActive = item.id === selectedLeadId;
          const priority = buildPriorityLabel(item);
          const scoreBar = Math.max(8, Math.min(100, item.closeProbability));

          return (
            <article
              key={item.id}
              className={`group flex min-w-0 flex-col justify-between gap-4 rounded-xl border-l-2 p-4 transition-all sm:p-6 lg:flex-row lg:items-center ${
                isActive
                  ? "border-[#58624e] bg-white shadow-sm"
                  : "border-transparent hover:bg-[#f5f3f0]"
              }`}
              onClick={() => handleRowClick(item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleRowClick(item.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:items-center">
                <div className="min-w-0">
                  <h3
                    className="break-words text-base text-[#313330] sm:text-lg"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    {item.fullName}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-stone-400">{buildArea(item)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#313330]">{buildBudget(item)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Presupuesto</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        item.closeProbability < 60
                          ? "font-semibold text-[#a73b21]"
                          : isActive
                            ? "font-semibold text-[#58624e]"
                            : "font-medium text-[#313330]"
                      }`}
                    >
                      {item.closeProbability}%
                    </span>
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-[#efeeea]">
                      <div
                        className={`${item.closeProbability < 60 ? "bg-[#a73b21]" : isActive ? "bg-[#58624e]" : "bg-[#4d5643]"}`}
                        style={{ height: "100%", width: `${scoreBar}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">
                    {item.closeProbability < 60 ? "En riesgo" : "Probabilidad"}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      priority.tone === "risk"
                        ? "bg-[#fd795a]/10 text-[#a73b21]"
                        : priority.tone === "hot"
                          ? "bg-[#58624e]/10 text-[#58624e]"
                          : "bg-[#efeeea] text-stone-500"
                    }`}
                  >
                    {priority.label}
                  </span>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">{buildLastActive(item)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {item.messaging.pendingApprovalCount > 0 ? (
                      <span className="rounded bg-[#58624e]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#58624e]">
                        {item.messaging.pendingApprovalCount} pendiente
                      </span>
                    ) : null}
                    {item.messaging.failedCount > 0 ? (
                      <span className="rounded bg-[#fd795a]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#a73b21]">
                        {item.messaging.failedCount} fallido
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 sm:space-x-6">
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    isActive
                      ? "border-b border-[#58624e]/30 text-[#58624e]"
                      : "text-stone-400 transition-colors group-hover:text-[#313330]"
                  }`}
                >
                  {buildActionLabel(item)}
                </span>
                <Link
                  aria-label={`Abrir dossier de ${item.fullName}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone-300 transition-colors hover:text-[#58624e]"
                  href={`/leads/${item.id}`}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
