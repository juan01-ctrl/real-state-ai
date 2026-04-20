"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface ChannelConnectionListItem {
  id: string;
  type: string;
  label: string;
  externalAccountId: string | null;
  status: string;
  hasToken: boolean;
  updatedAt: string;
}

interface MetaHealthConnection {
  id: string;
  type: string;
  label: string;
  externalAccountId: string | null;
  status: string;
  hasToken: boolean;
  updatedAt: string;
  inbound24h: number;
  outbound24h: number;
  lastMessageAt: string | null;
  lastMessageDirection: string | null;
}

interface MetaHealthData {
  summary: {
    totalConnections: number;
    connected: number;
    withToken: number;
    inbound24h: number;
    outbound24h: number;
    hasRecentActivity: boolean;
  };
  connections: MetaHealthConnection[];
  checkedAt: string;
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

  const [health, setHealth] = useState<MetaHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [testConnectionId, setTestConnectionId] = useState("");
  const [testRecipientId, setTestRecipientId] = useState("");
  const [testText, setTestText] = useState("Hola, este es un mensaje de prueba de Aesthete.");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  const checklist = useMemo(
    () => [
      { label: "Al menos una conexión creada", ok: connections.length > 0 },
      { label: "Al menos una conexión con token", ok: connections.some((c) => c.hasToken) },
      { label: "Actividad en las últimas 24h", ok: Boolean(health?.summary.hasRecentActivity) }
    ],
    [connections, health?.summary.hasRecentActivity]
  );

  const checklistDone = checklist.filter((item) => item.ok).length;

  useEffect(() => {
    if (!testConnectionId && connections.length > 0) {
      setTestConnectionId(connections[0].id);
    }
  }, [connections, testConnectionId]);

  useEffect(() => {
    void refreshHealth();
  }, []);

  async function refresh() {
    const res = await fetch("/api/channels/meta");
    const data = (await res.json()) as { connections?: ChannelConnectionListItem[]; ok?: boolean };
    if (data.connections) setConnections(data.connections);
    router.refresh();
    await refreshHealth();
  }

  async function refreshHealth() {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/channels/meta/health", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; summary?: MetaHealthData["summary"]; connections?: MetaHealthConnection[]; checkedAt?: string };
      if (res.ok && data.ok && data.summary && data.connections && data.checkedAt) {
        setHealth({ summary: data.summary, connections: data.connections, checkedAt: data.checkedAt });
      }
    } finally {
      setHealthLoading(false);
    }
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
        const map: Record<string, string> = {
          invalid_type: "Canal inválido.",
          externalAccountId_required: "Falta el identificador de cuenta en Meta.",
          encryption_key_missing: "Falta activar el cifrado del lado servidor para guardar tokens."
        };
        setError(map[data.error ?? ""] ?? "No se pudo guardar la conexión.");
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

  async function confirmRemoveConnection() {
    if (!removeConfirmId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/meta?id=${encodeURIComponent(removeConfirmId)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const msg =
          data.error === "not_found"
            ? "La conexión ya no existe."
            : data.error === "UNAUTHORIZED"
              ? "Sesión expirada. Volvé a iniciar sesión."
              : "No se pudo quitar la conexión.";
        setError(msg);
        setRemoveConfirmId(null);
        return;
      }
      setRemoveConfirmId(null);
      await refresh();
    } catch {
      setError("No se pudo quitar la conexión.");
      setRemoveConfirmId(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendTestMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!testConnectionId || !testRecipientId.trim() || !testText.trim()) return;

    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/channels/meta/test-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: testConnectionId,
          recipientId: testRecipientId.trim(),
          text: testText.trim()
        })
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        const map: Record<string, string> = {
          INVALID_INPUT: "Completá conexión, destinatario y mensaje.",
          NO_TOKEN: "La conexión seleccionada no tiene token de envío.",
          MISSING_EXTERNAL_ID: "La conexión no tiene ID de cuenta configurado.",
          TOKEN_DECRYPT_FAILED: "No se pudo usar el token guardado. Volvé a cargarlo en esta conexión.",
          GRAPH_ERROR: data.message || "Meta rechazó el envío de prueba."
        };
        setTestResult(map[data.error ?? ""] ?? "No se pudo enviar la prueba.");
        return;
      }

      setTestResult("Mensaje de prueba enviado correctamente.");
      await refreshHealth();
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-[#dce6cd]/60 bg-[#fafaf8] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Asistente de configuración</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5e5f5c]">
              Completá estos pasos operativos para dejar WhatsApp e Instagram funcionando en Aesthete.
            </p>
          </div>
          <button
            className="rounded border border-[#b2b2ae]/40 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#313330]"
            disabled={healthLoading}
            onClick={() => void refreshHealth()}
            type="button"
          >
            {healthLoading ? "Validando..." : "Validar estado"}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
            {checklistDone}/{checklist.length}
          </span>
          <p className="text-xs uppercase tracking-[0.14em] text-[#5e5f5c]">Checklist completado</p>
        </div>

        <ul className="space-y-2">
          {checklist.map((item) => (
            <li className="flex items-center gap-3" key={item.label}>
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  item.ok ? "bg-[#58624e] text-[#f2fde3]" : "bg-[#efeeea] text-[#5e5f5c]"
                }`}
              >
                {item.ok ? "✓" : "•"}
              </span>
              <span className="text-sm text-[#313330]">{item.label}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-[#5e5f5c]">
          Cuando completes los 3 pasos, la agencia ya queda lista para operar conversaciones desde WhatsApp e Instagram.
        </p>
      </div>

      {!encryptionConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Falta activar el cifrado seguro de credenciales en el servidor. Hasta resolverlo, no se podrán guardar tokens de
          envío.
        </p>
      ) : null}

      <form className="space-y-4 rounded-lg border border-[#e9e8e4] bg-white p-5 sm:p-6" onSubmit={onSubmit}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Registrar número o cuenta en Aesthete</p>
        <p className="text-xs text-[#5e5f5c]">
          <strong>WhatsApp:</strong> usá el identificador del número en Meta (no el número visible). <strong>Instagram:</strong>{" "}
          usá el identificador de la cuenta conectada.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Canal</span>
            <select
              className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
              onChange={(e) => setType(e.target.value as "WHATSAPP" | "INSTAGRAM")}
              value={type}
            >
              <option value="WHATSAPP">WhatsApp Business</option>
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
          <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">ID en Meta (phone_number_id o account id)</span>
          <input
            className="border border-[#b2b2ae]/40 bg-white px-3 py-2 font-mono text-sm"
            onChange={(e) => setExternalId(e.target.value)}
            placeholder="Ej. 109876543210987"
            required
            value={externalId}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Token de acceso (opcional al crear; se guarda cifrado)</span>
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

      <form className="space-y-4 rounded-lg border border-[#e9e8e4] bg-[#fafaf8] p-5 sm:p-6" onSubmit={sendTestMessage}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Prueba de envío</p>
        <p className="text-xs text-[#5e5f5c]">Enviá un mensaje de prueba para confirmar permisos y conexión real con Meta.</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Conexión</span>
            <select
              className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
              onChange={(event) => setTestConnectionId(event.target.value)}
              value={testConnectionId}
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {typeLabel(c.type)} · {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">ID destinatario</span>
            <input
              className="border border-[#b2b2ae]/40 bg-white px-3 py-2 font-mono text-sm"
              onChange={(event) => setTestRecipientId(event.target.value)}
              placeholder="WhatsApp: número sin + · IG: recipient id"
              value={testRecipientId}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Mensaje</span>
          <textarea
            className="min-h-24 border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
            onChange={(event) => setTestText(event.target.value)}
            value={testText}
          />
        </label>

        {testResult ? <p className="text-xs text-[#313330]">{testResult}</p> : null}

        <button
          className="bg-[#313330] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
          disabled={testLoading || connections.length === 0}
          type="submit"
        >
          {testLoading ? "Enviando..." : "Enviar prueba"}
        </button>
      </form>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Conexiones activas</p>
        {connections.length === 0 ? (
          <p className="text-sm text-[#5e5f5c]">Todavía no registraste IDs de Meta para esta agencia.</p>
        ) : (
          <ul className="divide-y divide-[#e9e8e4] rounded-lg border border-[#e9e8e4] bg-white">
            {connections.map((c) => {
              const healthRow = health?.connections.find((h) => h.id === c.id);
              return (
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
                    {healthRow ? (
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#5e5f5c]">
                        24h: {healthRow.inbound24h} entrantes · {healthRow.outbound24h} salientes
                        {healthRow.lastMessageAt ? ` · Último: ${new Date(healthRow.lastMessageAt).toLocaleString("es-AR")}` : " · Sin mensajes"}
                      </p>
                    ) : null}
                  </div>
                  <button
                    className="self-start text-[10px] font-semibold uppercase tracking-widest text-[#a73b21] hover:underline sm:self-center"
                    disabled={loading}
                    onClick={() => setRemoveConfirmId(c.id)}
                    type="button"
                  >
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Quitar conexión"
        description="Los webhooks dejarán de enrutar mensajes de este número o cuenta a tu agencia hasta que vuelvas a registrarla."
        loading={Boolean(loading && removeConfirmId)}
        open={removeConfirmId != null}
        title="¿Quitar esta conexión?"
        variant="danger"
        onCancel={() => {
          if (!loading) setRemoveConfirmId(null);
        }}
        onConfirm={() => void confirmRemoveConnection()}
      />
    </div>
  );
}
