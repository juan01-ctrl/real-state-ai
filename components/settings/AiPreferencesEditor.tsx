"use client";

import { useRef, useState } from "react";

type MatchingMode = "CONSERVADOR" | "AGRESIVO";
type OutreachTone =
  | "Sofisticado y reservado"
  | "Directo y profesional"
  | "Cálido y cercano"
  | "Técnico y preciso";

interface AiPreferencesEditorProps {
  initialSnapshotAt: string;
  initialUrgencyThreshold: number;
  initialMatchingMode: MatchingMode;
  initialOutreachTone: OutreachTone;
}

export function AiPreferencesEditor({
  initialSnapshotAt,
  initialUrgencyThreshold,
  initialMatchingMode,
  initialOutreachTone
}: AiPreferencesEditorProps) {
  const [snapshotAt, setSnapshotAt] = useState(initialSnapshotAt);
  const [urgencyThreshold, setUrgencyThreshold] = useState(initialUrgencyThreshold);
  const [lastSavedUrgency, setLastSavedUrgency] = useState(initialUrgencyThreshold);
  const [matchingMode, setMatchingMode] = useState<MatchingMode>(initialMatchingMode);
  const [outreachTone, setOutreachTone] = useState<OutreachTone>(initialOutreachTone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingUrgencyRef = useRef<number | null>(null);

  const sliderPct = `${Math.max(0, Math.min(100, urgencyThreshold))}%`;

  async function save(payload: Partial<{ urgencyThreshold: number; matchingMode: MatchingMode; outreachTone: OutreachTone }>) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/ai-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshotAt?: string;
        urgencyThreshold?: number;
        matchingMode?: MatchingMode;
        outreachTone?: OutreachTone;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "SAVE_FAILED");
      }

      if (typeof data.urgencyThreshold === "number") setUrgencyThreshold(data.urgencyThreshold);
      if (typeof data.urgencyThreshold === "number") setLastSavedUrgency(data.urgencyThreshold);
      if (data.matchingMode) setMatchingMode(data.matchingMode);
      if (data.outreachTone) setOutreachTone(data.outreachTone);
      if (data.snapshotAt) setSnapshotAt(data.snapshotAt);
      setMessage("Guardado");
    } catch (err) {
      const code = err instanceof Error ? err.message : "SAVE_FAILED";
      const map: Record<string, string> = {
        UNAUTHORIZED: "Tu sesión expiró. Volvé a ingresar.",
        INVALID_URGENCY_THRESHOLD: "Umbral de urgencia inválido.",
        INVALID_MATCHING_MODE: "Modo de matching inválido.",
        INVALID_OUTREACH_TONE: "Tono inválido.",
        EMPTY_PAYLOAD: "No hay cambios para guardar."
      };
      setError(map[code] ?? "No se pudo guardar la preferencia.");
    } finally {
      setSaving(false);
    }
  }

  const snapshotLabel = new Date(snapshotAt).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  function commitUrgency(value: number) {
    const bounded = Math.max(0, Math.min(100, value));
    setUrgencyThreshold(bounded);

    if (bounded === lastSavedUrgency || pendingUrgencyRef.current === bounded) return;

    pendingUrgencyRef.current = bounded;
    void save({ urgencyThreshold: bounded }).finally(() => {
      if (pendingUrgencyRef.current === bounded) pendingUrgencyRef.current = null;
    });
  }

  return (
    <section className="space-y-12 pb-16 sm:pb-24 lg:pb-32">
      <div className="border-l-8 border-[#58624e] bg-[#dce6cd]/30 p-6 sm:p-10 lg:p-12">
        <div className="max-w-2xl space-y-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58624e]">Núcleo de inteligencia</span>
            <h3 className="text-3xl italic text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
              Preferencias de IA
            </h3>
            <p className="text-xs uppercase tracking-[0.14em] text-[#313330]/45">Actualizado: {snapshotLabel}</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <label className="text-[12px] font-semibold uppercase tracking-widest">Umbrales de urgencia</label>
                <span className="text-[10px] font-medium text-[#58624e]">Prioridad al foco ({urgencyThreshold}%)</span>
              </div>
              <div className="relative mt-2 h-px w-full bg-[#b2b2ae]/30">
                <input
                  className="leadsignal-range-slider absolute left-0 top-1/2 z-10 h-4 w-full -translate-y-1/2 cursor-pointer bg-transparent"
                  max={100}
                  min={0}
                  onChange={(event) => setUrgencyThreshold(Number(event.target.value))}
                  onBlur={(event) => commitUrgency(Number(event.currentTarget.value))}
                  onKeyUp={(event) => commitUrgency(Number(event.currentTarget.value))}
                  onPointerUp={(event) => commitUrgency(Number(event.currentTarget.value))}
                  type="range"
                  value={urgencyThreshold}
                />
                <div className="pointer-events-none absolute left-0 top-0 h-px bg-[#58624e]" style={{ width: sliderPct }} />
                <div
                  className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#58624e] ring-8 ring-[#58624e]/10"
                  style={{ left: `calc(${sliderPct} - 8px)` }}
                />
              </div>
              <p className="text-[11px] italic text-[#313330]/50">Define con qué rapidez la IA interactúa con leads de alto valor.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-[12px] font-semibold uppercase tracking-widest">Exigencia del matching</label>
              <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4 sm:gap-0">
                <button
                  className={`flex-1 border py-4 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                    matchingMode === "CONSERVADOR"
                      ? "border-[#58624e] text-[#58624e]"
                      : "border-[#d8d8d4] bg-[#efeeea] text-[#313330]/40 hover:bg-[#e9e8e4]"
                  }`}
                  disabled={saving}
                  onClick={() => {
                    setMatchingMode("CONSERVADOR");
                    void save({ matchingMode: "CONSERVADOR" });
                  }}
                  type="button"
                >
                  Conservador
                </button>
                <button
                  className={`flex-1 border py-4 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                    matchingMode === "AGRESIVO"
                      ? "border-[#58624e] text-[#58624e]"
                      : "border-[#d8d8d4] bg-[#efeeea] text-[#313330]/40 hover:bg-[#e9e8e4]"
                  }`}
                  disabled={saving}
                  onClick={() => {
                    setMatchingMode("AGRESIVO");
                    void save({ matchingMode: "AGRESIVO" });
                  }}
                  type="button"
                >
                  Agresivo
                </button>
              </div>
              <p className="text-[11px] italic text-[#313330]/50">
                {matchingMode === "CONSERVADOR"
                  ? "Un matching conservador muestra solo encajes arquitectónicos muy altos."
                  : "El modo agresivo amplía el rango de opciones para descubrir oportunidades ocultas."}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-[12px] font-semibold uppercase tracking-widest">Tono del alcance automático</label>
              <select
                className="w-full border-0 border-b border-[#b2b2ae] bg-transparent py-3 text-sm font-body transition-all focus:border-[#58624e] focus:ring-0"
                disabled={saving}
                onChange={(event) => {
                  const next = event.target.value as OutreachTone;
                  setOutreachTone(next);
                  void save({ outreachTone: next });
                }}
                value={outreachTone}
              >
                <option>Sofisticado y reservado</option>
                <option>Directo y profesional</option>
                <option>Cálido y cercano</option>
                <option>Técnico y preciso</option>
              </select>
            </div>
          </div>

          <div className="min-h-5">
            {saving ? <p className="text-xs uppercase tracking-[0.12em] text-[#5e5f5c]">Guardando...</p> : null}
            {!saving && message ? <p className="text-xs uppercase tracking-[0.12em] text-[#58624e]">{message}</p> : null}
            {!saving && error ? <p className="text-xs uppercase tracking-[0.12em] text-[#a73b21]">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
