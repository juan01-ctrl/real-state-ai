"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeadDetailModel } from "@/lib/server/read-models/leads";

interface MetaOutboundComposerProps {
  leadId: string;
  metaReply: LeadDetailModel["metaReply"];
}

function channelName(t: string) {
  if (t === "WHATSAPP") return "WhatsApp";
  if (t === "INSTAGRAM") return "Instagram";
  return t;
}

function deliveryLabel(status: string | null) {
  if (status === "READ") return "Leído";
  if (status === "DELIVERED") return "Entregado";
  if (status === "NOT_SENT") return "No enviado";
  if (status === "FAILED") return "Fallido";
  return "Sin envíos aún";
}

export function MetaOutboundComposer({ leadId, metaReply }: MetaOutboundComposerProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingDraftId, setProcessingDraftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!metaReply) {
    return null;
  }

  async function saveDraft() {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/meta-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed })
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        setError(data.message ?? "No se pudo enviar");
        return;
      }
      setText("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function processDraft(messageId: string, action: "approve" | "discard") {
    setError(null);
    setProcessingDraftId(messageId);
    try {
      const res = await fetch(`/api/leads/${leadId}/meta-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, messageId })
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        setError(data.message ?? "No se pudo actualizar el borrador");
        return;
      }
      router.refresh();
    } finally {
      setProcessingDraftId(null);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#58624e]">
        Responder por {channelName(metaReply.channelType)} · {metaReply.channelLabel}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
        <span className="rounded bg-[#efeeea] px-2 py-0.5 text-stone-600">Último estado: {deliveryLabel(metaReply.lastOutboundStatus)}</span>
        {metaReply.pendingApprovalCount > 0 ? (
          <span className="rounded bg-[#58624e]/10 px-2 py-0.5 text-[#58624e]">{metaReply.pendingApprovalCount} pendientes</span>
        ) : null}
        {metaReply.failedCount > 0 ? (
          <span className="rounded bg-[#fd795a]/10 px-2 py-0.5 text-[#a73b21]">{metaReply.failedCount} fallidos</span>
        ) : null}
      </div>
      {!metaReply.canSend && metaReply.missingTokenHint ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-800">{metaReply.missingTokenHint}</p>
      ) : null}

      {metaReply.pendingDrafts.length > 0 ? (
        <div className="mt-3 space-y-2 rounded-md border border-[#e9e8e4] bg-[#fafaf8] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600">Borradores pendientes</p>
          {metaReply.pendingDrafts.map((draft) => (
            <div key={draft.id} className="rounded-md border border-stone-200 bg-white p-2.5">
              <p className="text-xs leading-relaxed text-[#313330]">{draft.body}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-stone-400">
                  {new Date(draft.sentAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border border-stone-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600 disabled:opacity-50"
                    disabled={processingDraftId != null}
                    onClick={() => void processDraft(draft.id, "discard")}
                    type="button"
                  >
                    Descartar
                  </button>
                  <button
                    className="rounded bg-[#58624e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f2fde3] disabled:opacity-50"
                    disabled={processingDraftId != null}
                    onClick={() => void processDraft(draft.id, "approve")}
                    type="button"
                  >
                    {processingDraftId === draft.id ? "Enviando…" : "Aprobar y enviar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        className="mt-3 w-full resize-none rounded-md border border-stone-200 bg-[#fafaf8] px-3 py-2 text-sm text-[#313330] placeholder:text-stone-400 disabled:opacity-60"
        disabled={!metaReply.canSend || loading}
        onChange={(e) => setText(e.target.value)}
        placeholder={metaReply.canSend ? "Escribí el mensaje al contacto…" : "Token no configurado"}
        rows={3}
        value={text}
      />
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      <button
        className="mt-3 w-full rounded-md bg-[#58624e] py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f2fde3] disabled:opacity-50"
        disabled={!metaReply.canSend || loading || !text.trim()}
        onClick={() => void saveDraft()}
        type="button"
      >
        {loading ? "Guardando…" : "Guardar borrador"}
      </button>
    </div>
  );
}
