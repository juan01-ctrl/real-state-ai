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

export function MetaOutboundComposer({ leadId, metaReply }: MetaOutboundComposerProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!metaReply) {
    return null;
  }

  async function send() {
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

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#58624e]">
        Responder por {channelName(metaReply.channelType)} · {metaReply.channelLabel}
      </p>
      {!metaReply.canSend && metaReply.missingTokenHint ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-800">{metaReply.missingTokenHint}</p>
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
        onClick={() => void send()}
        type="button"
      >
        {loading ? "Enviando…" : "Enviar por Meta"}
      </button>
    </div>
  );
}
