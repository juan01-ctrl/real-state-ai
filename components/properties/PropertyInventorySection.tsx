"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { PropertyCardModel } from "@/lib/server/read-models/properties-page";

type FormState = {
  title: string;
  neighborhood: string;
  price: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  useCase: "LIVING" | "INVESTMENT";
  appreciationNote: string;
};

const emptyForm = (): FormState => ({
  title: "",
  neighborhood: "",
  price: "",
  currency: "USD",
  bedrooms: "2",
  bathrooms: "1",
  propertyType: "apartment",
  useCase: "LIVING",
  appreciationNote: ""
});

function cardToForm(card: PropertyCardModel): FormState {
  return {
    title: card.title,
    neighborhood: card.zone,
    price: String(card.priceValue),
    currency: card.currencyCode || "USD",
    bedrooms: String(card.bedrooms),
    bathrooms: String(card.bathrooms),
    propertyType: card.propertyType,
    useCase: card.useCase === "INVESTMENT" ? "INVESTMENT" : "LIVING",
    appreciationNote: card.appreciationNote ?? ""
  };
}

function FeaturedPropertyCard({
  card,
  footer
}: {
  card: PropertyCardModel;
  footer: React.ReactNode;
}) {
  return (
    <article className="group overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
        {card.imageUrl ? (
          <img alt={card.imageAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={card.imageUrl} />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 via-stone-100 to-[#efeeea] text-4xl text-stone-400 serif"
          >
            {card.title.slice(0, 1)}
          </div>
        )}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <div className="rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur">
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-primary">Match medio</span>
            <span className="block text-3xl serif text-on-surface">{card.scoreLabel}</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{card.zone}</p>
            <h4 className="mt-1 text-2xl serif text-on-surface">{card.title}</h4>
          </div>
          <p className="text-2xl serif text-on-surface">{card.price}</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-stone-100 pt-6 text-[11px] uppercase tracking-widest sm:flex-row sm:gap-8">
          {card.details.map((detail, index) => (
            <div className="flex items-center gap-2" key={`${card.id}-${detail}`}>
              <span className="material-symbols-outlined text-stone-400">{card.icons[index]}</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>

        {footer ? <div className="mt-6 border-t border-stone-100 pt-4">{footer}</div> : null}
      </div>
    </article>
  );
}

function PropertyFormModal({
  open,
  title,
  form,
  error,
  loading,
  onChange,
  onSubmit,
  onClose
}: {
  open: boolean;
  title: string;
  form: FormState;
  error: string | null;
  loading: boolean;
  onChange: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
    >
      <button aria-label="Cerrar" className="absolute inset-0 cursor-default" type="button" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-[#fbf9f6] p-6 shadow-xl sm:p-8">
        <h3 className="text-xl serif text-on-surface">{title}</h3>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Título</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
              required
              type="text"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Barrio / zona</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
              required
              type="text"
              value={form.neighborhood}
              onChange={(e) => onChange({ ...form, neighborhood: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Precio</span>
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
                min={0}
                required
                step={1}
                type="number"
                value={form.price}
                onChange={(e) => onChange({ ...form, price: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Moneda</span>
              <select
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
                value={form.currency}
                onChange={(e) => onChange({ ...form, currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Dormitorios</span>
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
                min={0}
                required
                step={1}
                type="number"
                value={form.bedrooms}
                onChange={(e) => onChange({ ...form, bedrooms: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Baños</span>
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
                min={0}
                required
                step={1}
                type="number"
                value={form.bathrooms}
                onChange={(e) => onChange({ ...form, bathrooms: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Tipo (código interno)</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
              placeholder="apartment, single_family, townhouse…"
              required
              type="text"
              value={form.propertyType}
              onChange={(e) => onChange({ ...form, propertyType: e.target.value })}
            />
            <span className="mt-1 block text-[11px] text-stone-500">Se muestra en informes con la etiqueta configurada en el sistema.</span>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Caso de uso</span>
            <select
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
              value={form.useCase}
              onChange={(e) => onChange({ ...form, useCase: e.target.value as FormState["useCase"] })}
            >
              <option value="LIVING">Vivienda</option>
              <option value="INVESTMENT">Inversión</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nota / apreciación (opcional)</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-on-surface"
              rows={3}
              value={form.appreciationNote}
              onChange={(e) => onChange({ ...form, appreciationNote: e.target.value })}
            />
          </label>

          {error ? <p className="text-sm text-[#a73b21]">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              className="rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100"
              disabled={loading}
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-on-primary disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PropertyInventorySectionProps {
  properties: PropertyCardModel[];
}

export function PropertyInventorySection({ properties }: PropertyInventorySectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((card: PropertyCardModel) => {
    setEditingId(card.id);
    setForm(cardToForm(card));
    setError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (loading) return;
    setModalOpen(false);
    setEditingId(null);
    setError(null);
  }, [loading]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const price = Number(form.price);
      const bedrooms = Number(form.bedrooms);
      const bathrooms = Number(form.bathrooms);
      const payload = {
        title: form.title.trim(),
        neighborhood: form.neighborhood.trim(),
        price,
        currency: form.currency.trim() || "USD",
        bedrooms,
        bathrooms,
        propertyType: form.propertyType.trim(),
        useCase: form.useCase,
        appreciationNote: form.appreciationNote.trim() || null
      };

      setLoading(true);
      try {
        const url = editingId ? `/api/properties/${editingId}` : "/api/properties";
        const method = editingId ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "No se pudo guardar");
          return;
        }
        setModalOpen(false);
        setEditingId(null);
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [editingId, form, router]
  );

  const confirmDeleteProperty = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleteDialogError(null);
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/properties/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteDialogError("No se pudo eliminar la propiedad. Intentá de nuevo.");
        return;
      }
      setPendingDelete(null);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }, [pendingDelete, router]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-on-surface/80">
          Gestioná el inventario: altas, ediciones y bajas. Los cambios se reflejan al instante en recomendaciones nuevas.
        </p>
        <button
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-on-primary hover:opacity-95 disabled:opacity-50"
          disabled={loading || deleteLoading}
          type="button"
          onClick={openCreate}
        >
          Agregar propiedad
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-on-surface/80">
          Todavía no hay propiedades cargadas. Usá «Agregar propiedad» para crear la primera ficha.
        </p>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {properties.map((card) => (
            <FeaturedPropertyCard
              key={card.id}
              card={card}
              footer={
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="text-[11px] font-bold uppercase tracking-widest text-primary underline-offset-2 hover:underline"
                    disabled={loading || deleteLoading}
                    type="button"
                    onClick={() => openEdit(card)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-[11px] font-bold uppercase tracking-widest text-[#a73b21] underline-offset-2 hover:underline"
                    disabled={loading || deleteLoading}
                    type="button"
                    onClick={() => {
                      setDeleteDialogError(null);
                      setPendingDelete({ id: card.id, title: card.title });
                    }}
                  >
                    Eliminar
                  </button>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">ID: {card.id.slice(0, 8)}…</span>
                </div>
              }
            />
          ))}
        </div>
      )}

      <PropertyFormModal
        error={error}
        form={form}
        loading={loading}
        open={modalOpen}
        title={editingId ? "Editar propiedad" : "Nueva propiedad"}
        onChange={setForm}
        onClose={closeModal}
        onSubmit={submit}
      />

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Eliminar propiedad"
        description={
          pendingDelete
            ? `¿Eliminar «${pendingDelete.title}»? Se quitarán también las vinculaciones en recomendaciones.`
            : ""
        }
        error={deleteDialogError}
        loading={deleteLoading}
        open={pendingDelete != null}
        title="Eliminar propiedad"
        variant="danger"
        onCancel={() => {
          if (!deleteLoading) {
            setPendingDelete(null);
            setDeleteDialogError(null);
          }
        }}
        onConfirm={() => void confirmDeleteProperty()}
      />
    </>
  );
}
