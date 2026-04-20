"use server";

import { revalidatePath } from "next/cache";
import { LeadStage, TaskType } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import {
  addLeadNote,
  assignLeadOwner,
  changeLeadStage,
  completeLeadTask,
  createLeadTask,
  markVisitBooked
} from "@/lib/server/lead-mutations";

function revalidateLeadSurfaces(leadId: string) {
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/team");
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
}

async function withSession<T>(fn: (ctx: { agencyId: string; name: string; userId: string }) => Promise<T>): Promise<T | { ok: false; error: "UNAUTHORIZED" }> {
  try {
    const ctx = await requireSessionContext();
    return fn({
      agencyId: ctx.agencyId,
      name: ctx.name,
      userId: ctx.userId
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { ok: false as const, error: "UNAUTHORIZED" as const };
    }
    throw e;
  }
}

export async function actionChangeLeadStage(leadId: string, stage: LeadStage) {
  return withSession(async ({ agencyId }) => {
    const result = await changeLeadStage(leadId, agencyId, stage, "Cambio de etapa desde la app");
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}

export async function actionAssignLeadOwner(leadId: string, ownerUserId: string | null) {
  return withSession(async ({ agencyId }) => {
    const result = await assignLeadOwner(leadId, agencyId, ownerUserId);
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}

export async function actionAddLeadNote(leadId: string, body: string) {
  return withSession(async ({ agencyId, name }) => {
    const result = await addLeadNote(leadId, agencyId, body, name || "Operador");
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}

export async function actionCreateLeadTask(
  leadId: string,
  payload: { title: string; type?: TaskType; dueAtIso?: string | null }
) {
  return withSession(async ({ agencyId }) => {
    const dueAt =
      payload.dueAtIso != null && payload.dueAtIso !== ""
        ? new Date(payload.dueAtIso)
        : null;
    const result = await createLeadTask(leadId, agencyId, {
      title: payload.title,
      type: payload.type ?? TaskType.CALL,
      dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null
    });
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}

export async function actionCompleteLeadTask(leadId: string, taskId: string) {
  return withSession(async ({ agencyId }) => {
    const result = await completeLeadTask(leadId, agencyId, taskId);
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}

export async function actionMarkVisitBooked(leadId: string) {
  return withSession(async ({ agencyId }) => {
    const result = await markVisitBooked(leadId, agencyId);
    if (result.ok) revalidateLeadSurfaces(leadId);
    return result;
  });
}
