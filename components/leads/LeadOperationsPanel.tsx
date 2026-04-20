"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LeadStage, TaskStatus, TaskType } from "@prisma/client";
import {
  actionAddLeadNote,
  actionAssignLeadOwner,
  actionChangeLeadStage,
  actionCompleteLeadTask,
  actionCreateLeadTask,
  actionMarkVisitBooked,
  actionReopenLeadTask
} from "@/lib/server/actions/lead-actions";
import { displayLeadStage, displayTaskStatus } from "@/lib/i18n/present";
import type { AgencyOperator } from "@/lib/server/read-models/operators";
import type { LeadDetailModel } from "@/lib/server/read-models/leads";

const STAGES: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.VISIT_SCHEDULED,
  LeadStage.OFFER_NEGOTIATION,
  LeadStage.WON,
  LeadStage.LOST,
  LeadStage.NURTURE
];

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: TaskType.CALL, label: "Llamada" },
  { value: TaskType.FOLLOW_UP_MESSAGE, label: "Mensaje de seguimiento" },
  { value: TaskType.VISIT_CONFIRM, label: "Confirmar visita" },
  { value: TaskType.MANUAL_REVIEW, label: "Revisión manual" }
];

function taskTypeLabel(type: string) {
  return TASK_TYPES.find((x) => x.value === type)?.label ?? type;
}

/** El modelo serializa enums como string; normalizamos por si el runtime difiere. */
function isTaskOpenStatus(status: string) {
  return status === TaskStatus.OPEN || status === "OPEN";
}

interface LeadOperationsPanelProps {
  leadId: string;
  operators: AgencyOperator[];
  lead: Pick<LeadDetailModel, "stage" | "ownerUserId" | "tasks" | "notes">;
  variant?: "panel" | "dossier";
}

export function LeadOperationsPanel({
  leadId,
  operators,
  lead,
  variant = "panel"
}: LeadOperationsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(fn: () => Promise<unknown>) {
    startTransition(() => {
      void (async () => {
        await fn();
        router.refresh();
      })();
    });
  }

  const shell =
    variant === "panel"
      ? "rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm"
      : "rounded-lg border border-outline-variant/20 bg-surface-container-low p-6";

  const openTasks = lead.tasks.filter((t) => isTaskOpenStatus(t.status));
  const closedTasks = lead.tasks.filter((t) => !isTaskOpenStatus(t.status));

  return (
    <div className={`space-y-6 ${shell}`}>
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#58624e]">Operativa</p>
        <div className={`grid gap-4 ${variant === "panel" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-stone-400">Etapa</span>
            <select
              className="w-full border border-stone-200 bg-[#fbf9f6] px-3 py-2 text-sm text-[#313330] outline-none transition-colors focus:border-[#58624e]"
              disabled={pending}
              value={lead.stage}
              onChange={(e) => {
                const v = e.target.value as LeadStage;
                runAction(() => actionChangeLeadStage(leadId, v));
              }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {displayLeadStage(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-stone-400">Responsable</span>
            <select
              className="w-full border border-stone-200 bg-[#fbf9f6] px-3 py-2 text-sm text-[#313330] outline-none transition-colors focus:border-[#58624e]"
              disabled={pending}
              value={lead.ownerUserId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                runAction(() => actionAssignLeadOwner(leadId, v === "" ? null : v));
              }}
            >
              <option value="">Sin asignar</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <button
            className="w-full border border-[#58624e] bg-[#58624e]/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#58624e] transition-colors hover:bg-[#58624e]/10 disabled:opacity-50"
            disabled={pending}
            type="button"
            onClick={() => runAction(() => actionMarkVisitBooked(leadId))}
          >
            Marcar visita agendada
          </button>
          <p className="mt-2 text-[10px] leading-relaxed text-stone-400">
            Si el lead está en etapa previa, pasamos a «Visita agendada» y generamos un recordatorio de confirmación.
          </p>
        </div>
      </div>

      <div className="border-t border-stone-100 pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Tareas</p>
        <ul className="mb-4 space-y-3">
          {lead.tasks.length === 0 ? (
            <li className="text-xs text-stone-400">No hay tareas registradas.</li>
          ) : (
            <>
              {openTasks.length > 0 ? (
                <li className="list-none">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#58624e]">Pendientes</p>
                  <ul className="space-y-2">
                    {openTasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start justify-between gap-3 rounded border border-stone-200 bg-white px-3 py-2.5 text-xs text-[#313330]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{t.title}</p>
                          <p className="mt-1 text-[10px] text-stone-500">
                            {taskTypeLabel(t.type)} ·{" "}
                            <span className="font-medium text-[#58624e]">{displayTaskStatus(t.status)}</span>
                          </p>
                        </div>
                        <button
                          className="shrink-0 rounded border border-[#58624e]/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#58624e] transition-colors hover:bg-[#58624e]/10 disabled:opacity-40"
                          disabled={pending}
                          type="button"
                          onClick={() => runAction(() => actionCompleteLeadTask(leadId, t.id))}
                        >
                          Marcar hecha
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
              {closedTasks.length > 0 ? (
                <li className="list-none">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Historial</p>
                  <ul className="space-y-2">
                    {closedTasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start justify-between gap-3 rounded border border-stone-100 bg-[#fafaf8] px-3 py-2 text-xs text-stone-600"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{t.title}</p>
                          <p className="mt-1 text-[10px] text-stone-500">
                            {taskTypeLabel(t.type)} · {displayTaskStatus(t.status)}
                          </p>
                        </div>
                        {t.status === TaskStatus.COMPLETED || t.status === "COMPLETED" ? (
                          <button
                            className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#58624e] underline-offset-2 hover:underline disabled:opacity-40"
                            disabled={pending}
                            type="button"
                            onClick={() => runAction(() => actionReopenLeadTask(leadId, t.id))}
                          >
                            Reabrir
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </>
          )}
        </ul>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const title = String(fd.get("title") ?? "").trim();
            const type = (String(fd.get("taskType") ?? "CALL") || "CALL") as TaskType;
            if (!title) return;
            runAction(async () => {
              await actionCreateLeadTask(leadId, { title, type });
              e.currentTarget.reset();
            });
          }}
        >
          <div className="min-w-0 w-full">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-stone-400">Nueva tarea</span>
            <input
              className="w-full border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#58624e]"
              name="title"
              placeholder="Ej.: Llamar para coordinar horario"
              required
              disabled={pending}
            />
          </div>
          <select
            className="w-full border border-stone-200 bg-white px-3 py-2 text-sm text-[#313330]"
            name="taskType"
            disabled={pending}
          >
            {TASK_TYPES.map((tt) => (
              <option key={tt.value} value={tt.value}>
                {tt.label}
              </option>
            ))}
          </select>
          <button
            className="w-full bg-[#313330] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#fbf9f6] transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={pending}
            type="submit"
          >
            Crear
          </button>
        </form>
      </div>

      <div className="border-t border-stone-100 pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Notas internas</p>
        <ul className="mb-3 max-h-36 space-y-2 overflow-y-auto">
          {lead.notes.slice(0, 8).map((n) => (
            <li key={n.id} className="rounded border border-stone-100 bg-[#fafaf8] px-3 py-2 text-xs text-stone-600">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">
                {n.author} · {new Date(n.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
            </li>
          ))}
        </ul>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = String(fd.get("noteBody") ?? "").trim();
            if (!body) return;
            runAction(async () => {
              await actionAddLeadNote(leadId, body);
              e.currentTarget.reset();
            });
          }}
        >
          <textarea
            className="min-h-[72px] w-full resize-y border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#58624e]"
            name="noteBody"
            placeholder="Agregá contexto para el equipo…"
            disabled={pending}
          />
          <button
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58624e] underline decoration-[#58624e]/30 underline-offset-4 hover:decoration-[#58624e] disabled:opacity-40"
            disabled={pending}
            type="submit"
          >
            Guardar nota
          </button>
        </form>
      </div>

      {pending ? (
        <p className="text-center text-[10px] uppercase tracking-widest text-stone-400">Guardando…</p>
      ) : null}
    </div>
  );
}
