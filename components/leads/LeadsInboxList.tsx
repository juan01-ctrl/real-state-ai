"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadInboxItem } from "@/lib/server/read-models/leads";
import { formatCurrencyUSD, formatRelativeHours } from "@/lib/formatters";

interface LeadsInboxListProps {
  items: LeadInboxItem[];
  agencyId: string;
  selectedLeadId: string | null;
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
  if ((item.silenceHours ?? 0) >= 48) return "Reactivar";
  if (item.closeProbability >= 85) return "Agendar visita";
  return item.recommendedNextAction?.title ? "Ver acción" : "Definir acción";
}

export function LeadsInboxList({ items, agencyId, selectedLeadId }: LeadsInboxListProps) {
  const router = useRouter();

  const handleRowClick = (leadId: string) => {
    router.push(`/leads?agencyId=${agencyId}&leadId=${leadId}`);
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-2 sm:mb-10 sm:gap-6">
        {["Alta probabilidad", "En riesgo", "Nuevos hoy", "Esperando seguimiento"].map((filter, index) => (
          <button
            key={filter}
            className={`pb-1 text-[10px] font-medium uppercase tracking-[0.15em] sm:text-[11px] ${
              index === 0
                ? "border-b border-[#58624e] text-[#313330]"
                : "text-stone-400 transition-colors hover:text-[#313330]"
            }`}
            type="button"
          >
            {filter}
          </button>
        ))}
        <button
          className="flex items-center pb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400 transition-colors hover:text-[#313330] sm:text-[11px]"
          type="button"
        >
          Fuente <span className="material-symbols-outlined ml-1 text-[14px]">expand_more</span>
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item) => {
          const isActive = item.id === selectedLeadId;
          const priority = buildPriorityLabel(item);
          const scoreBar = Math.max(8, Math.min(100, item.closeProbability));

          return (
            <article
              key={item.id}
              className={`group flex flex-col justify-between gap-4 rounded-xl border-l-2 p-4 transition-all sm:p-6 lg:flex-row lg:items-center ${
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
              <div className="grid flex-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:items-center">
                <div>
                  <h3 className="text-base text-[#313330] sm:text-lg" style={{ fontFamily: "'Noto Serif', serif" }}>
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
                  href={`/leads/${item.id}?agencyId=${agencyId}`}
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
