"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Alineado con `ChannelConnectionListItem` del servidor (evita importar módulos con Prisma en el cliente). */
export interface ChannelConnectionListItem {
  id: string;
  type: string;
  label: string;
  externalAccountId: string | null;
  status: string;
  hasToken: boolean;
  updatedAt: string;
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    CONNECTED: "Conectado",
    PENDING_SETUP: "Configuración pendiente",
    DISCONNECTED: "Desconectado"
  };
  return map[s] ?? s;
}

function typeLabel(t: string) {
  if (t === "WHATSAPP") return "WhatsApp";
  if (t === "INSTAGRAM") return "Instagram";
  return t;
}

interface MetaChannelConnectionsProps {
  initialConnections: ChannelConnectionListItem[];
  webhookUrl: string;
  verifyConfigured: boolean;
  secretConfigured: boolean;
  encryptionConfigured: boolean;
}

export function MetaChannelConnections({
  initialConnections,
  webhookUrl,
  verifyConfigured,
  secretConfigured,
  encryptionConfigured
}: MetaChannelConnectionsProps) {
  const router = useRouter();
  const [connections, setConnections] = useState(initialConnections);
  const [type, setType] = useState<"WHATSAPP" | "INSTAGRAM">("WHATSAPP");
  const [label, setLabel] = useState("");
  const [externalId, setExternalId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/channels/meta");
    const data = (await res.json()) as { connections?: ChannelConnectionListItem[]; ok?: boolean };
    if (data.connections) setConnections(data.connections);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/channels/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          label: label.trim() || undefined,
          externalAccountId: externalId.trim(),
          ...(accessToken.trim() ? { accessToken: accessToken.trim() } : {})
        })
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error === "invalid_type" ? "Tipo inválido" : "No se pudo guardar");
        return;
      }
      setExternalId("");
      setLabel("");
      setAccessToken("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Quitar esta conexión? Los webhooks dejarán de enrutar a tu agencia.")) return;
    setLoading(true);
    try {
      await fetch(`/api/channels/meta?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {!encryptionConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Definí <code className="text-xs">META_TOKEN_ENCRYPTION_KEY</code> (32 bytes en base64) en el servidor para guardar
          tokens de acceso cifrados y poder enviar mensajes.
        </p>
      ) : null}

      <div className="rounded-lg border border-[#dce6cd]/60 bg-[#fafaf8] p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Webhook Meta</p>
        <p className="mt-2 text-sm leading-relaxed text-[#5e5f5c]">
          En Meta for Developers, suscribí la app al mismo callback URL y verify token para WhatsApp Cloud API e Instagram.
        </p>
        <dl className="mt-4 space-y-2 text-xs text-[#313330]">
          <div>
            <dt className="font-medium text-[#58624e]">URL de callback</dt>
            <dd className="mt-0.5 break-all font-mono text-[11px]">{webhookUrl || "Definí NEXT_PUBLIC_APP_URL o BETTER_AUTH_URL"}</dd>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <span className="text-[#5e5f5c]">
              Verify token: {verifyConfigured ? <strong className="text-[#58624e]">configurado (env)</strong> : <strong className="text-[#a73b21]">falta META_WEBHOOK_VERIFY_TOKEN</strong>}
            </span>
            <span className="text-[#5e5f5c]">
              Firma HMAC: {secretConfigured ? <strong className="text-[#58624e]">activa</strong> : <strong className="text-[#686028]">opcional (META_APP_SECRET)</strong>}
            </span>
          </div>
        </dl>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Registrar número o cuenta en Aesthete</p>
        <p className="text-xs text-[#5e5f5c]">
          <strong>WhatsApp:</strong> Phone number ID de la API de WhatsApp Cloud (no el número de teléfono). <strong>Instagram:</strong> ID de la cuenta de Instagram conectada al producto de mensajería.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Canal</span>
            <select
              className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
              onChange={(e) => setType(e.target.value as "WHATSAPP" | "INSTAGRAM")}
              value={type}
            >
              <option value="WHATSAPP">WhatsApp Business (Cloud API)</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Etiqueta</span>
            <input
              className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Oficina Palermo"
              value={label}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">ID en Meta (phone_number_id o Instagram account id)</span>
          <input
            className="border border-[#b2b2ae]/40 bg-white px-3 py-2 font-mono text-sm"
            onChange={(e) => setExternalId(e.target.value)}
            placeholder="Ej. 109876543210987"
            required
            value={externalId}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">
            Token de acceso (Graph API) — opcional al crear; se guarda cifrado
          </span>
          <input
            autoComplete="off"
            className="border border-[#b2b2ae]/40 bg-white px-3 py-2 font-mono text-sm"
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAG…"
            type="password"
            value={accessToken}
          />
        </label>
        {error ? <p className="text-xs text-[#a73b21]">{error}</p> : null}
        <button
          className="bg-[#58624e] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f2fde3] disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          Guardar conexión
        </button>
      </form>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Conexiones activas</p>
        {connections.length === 0 ? (
          <p className="text-sm text-[#5e5f5c]">Todavía no registraste IDs de Meta para esta agencia.</p>
        ) : (
          <ul className="divide-y divide-[#e9e8e4] rounded-lg border border-[#e9e8e4] bg-white">
            {connections.map((c) => (
              <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={c.id}>
                <div>
                  <p className="text-sm font-medium text-[#313330]">
                    {typeLabel(c.type)} · {c.label}
                  </p>
                  <p className="font-mono text-[11px] text-[#5e5f5c]">{c.externalAccountId}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#58624e]">
                    {statusLabel(c.status)} · {c.hasToken ? "Token guardado" : "Sin token de envío"} · actualizado{" "}
                    {new Date(c.updatedAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <button
                  className="self-start text-[10px] font-semibold uppercase tracking-widest text-[#a73b21] hover:underline sm:self-center"
                  disabled={loading}
                  onClick={() => remove(c.id)}
                  type="button"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
