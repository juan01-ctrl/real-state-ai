"use client";

import { useEffect, useId, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** Mensaje de error inline (p. ej. fallo de API). */
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "neutral";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación modal (reemplaza `window.confirm` / `alert` del navegador).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  error,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const errId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-[#a73b21] text-white hover:opacity-95"
      : "bg-[#58624e] text-[#f2fde3] hover:opacity-95";

  return (
    <div
      aria-describedby={error ? `${descId} ${errId}` : descId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="alertdialog"
    >
      <button
        aria-label="Cerrar diálogo"
        className="absolute inset-0 cursor-default"
        disabled={loading}
        type="button"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-stone-200 bg-[#fbf9f6] p-6 shadow-xl sm:p-8">
        <h2 className="text-lg text-[#313330]" id={titleId} style={{ fontFamily: "'Noto Serif', serif" }}>
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#5e5f5c]" id={descId}>
          {description}
        </p>
        {error ? (
          <p className="mt-3 text-sm text-[#a73b21]" id={errId} role="status">
            {error}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            className="rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 disabled:opacity-50"
            disabled={loading}
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 ${confirmClass}`}
            disabled={loading}
            type="button"
            onClick={onConfirm}
          >
            {loading ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
