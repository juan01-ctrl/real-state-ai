"use client";

import { FormEvent, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface TeamMemberListItem {
  id: string;
  name: string;
  email: string;
  role: "AGENCY_ADMIN" | "AGENT";
  createdAt: string;
  activeLeads: number;
  openTasks: number;
}

interface TeamMembersManagerProps {
  initialMembers: TeamMemberListItem[];
  initialDbNow: string;
}

function roleLabel(role: TeamMemberListItem["role"]) {
  return role === "AGENCY_ADMIN" ? "Admin" : "Agente";
}

function errorLabel(error: string) {
  const map: Record<string, string> = {
    NAME_EMAIL_REQUIRED: "Nombre y email son obligatorios.",
    EMAIL_ALREADY_EXISTS: "Ese email ya existe en la agencia.",
    CANNOT_DELETE_SELF: "No podés eliminarte a vos mismo.",
    LAST_ADMIN_PROTECTED: "No podés dejar a la agencia sin administrador.",
    NOT_FOUND: "Miembro no encontrado.",
    UNAUTHORIZED: "Tu sesión expiró. Ingresá nuevamente."
  };
  return map[error] ?? "No se pudo completar la operación.";
}

export function TeamMembersManager({ initialMembers, initialDbNow }: TeamMembersManagerProps) {
  const [members, setMembers] = useState<TeamMemberListItem[]>(initialMembers);
  const [dbNow, setDbNow] = useState(initialDbNow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<TeamMemberListItem["role"]>("AGENT");
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingRole, setEditingRole] = useState<TeamMemberListItem["role"]>("AGENT");

  const stats = useMemo(() => {
    const totalLeads = members.reduce((acc, item) => acc + item.activeLeads, 0);
    const totalOpenTasks = members.reduce((acc, item) => acc + item.openTasks, 0);
    return {
      totalLeads,
      totalOpenTasks
    };
  }, [members]);

  async function refreshMembers() {
    const res = await fetch("/api/team/members", { method: "GET" });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      members?: TeamMemberListItem[];
      dbNow?: string;
    };

    if (!res.ok || !data.ok || !data.members || !data.dbNow) {
      throw new Error(data.error ?? "FETCH_FAILED");
    }

    setMembers(data.members);
    setDbNow(data.dbNow);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/team/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole
        })
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        members?: TeamMemberListItem[];
        dbNow?: string;
      };

      if (!res.ok || !data.ok || !data.members || !data.dbNow) {
        throw new Error(data.error ?? "CREATE_FAILED");
      }

      setMembers(data.members);
      setDbNow(data.dbNow);
      setNewName("");
      setNewEmail("");
      setNewRole("AGENT");
    } catch (err) {
      setError(errorLabel(err instanceof Error ? err.message : "CREATE_FAILED"));
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteMember() {
    const userId = deleteConfirmUserId;
    if (!userId) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/team/members/${encodeURIComponent(userId)}`, {
        method: "DELETE"
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        members?: TeamMemberListItem[];
        dbNow?: string;
      };

      if (!res.ok || !data.ok || !data.members || !data.dbNow) {
        throw new Error(data.error ?? "DELETE_FAILED");
      }

      setMembers(data.members);
      setDbNow(data.dbNow);
      setDeleteConfirmUserId(null);
    } catch (err) {
      setError(errorLabel(err instanceof Error ? err.message : "DELETE_FAILED"));
      setDeleteConfirmUserId(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(userId: string) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/team/members/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editingName,
          role: editingRole
        })
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        members?: TeamMemberListItem[];
        dbNow?: string;
      };

      if (!res.ok || !data.ok || !data.members || !data.dbNow) {
        throw new Error(data.error ?? "UPDATE_FAILED");
      }

      setMembers(data.members);
      setDbNow(data.dbNow);
      setEditingUserId(null);
      setEditingName("");
      setEditingRole("AGENT");
    } catch (err) {
      setError(errorLabel(err instanceof Error ? err.message : "UPDATE_FAILED"));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(member: TeamMemberListItem) {
    setEditingUserId(member.id);
    setEditingName(member.name);
    setEditingRole(member.role);
  }

  const dbNowLabel = new Date(dbNow).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <section className="scroll-mt-28 space-y-6" id="equipo">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#b2b2ae]/10 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Equipo de curaduría</span>
          <h3 className="text-3xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
            Equipo activo
          </h3>
          <p className="text-xs text-[#5e5f5c]">Actualizado: {dbNowLabel}</p>
        </div>

        <div className="rounded-md border border-[#e9e8e4] bg-white px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Carga actual del equipo</p>
          <p className="mt-1 text-sm text-[#313330]">
            {stats.totalLeads} leads activos · {stats.totalOpenTasks} tareas abiertas
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-lg border border-[#e9e8e4] bg-white p-4 sm:grid-cols-4" onSubmit={handleCreate}>
        <input
          className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nombre"
          required
          value={newName}
        />
        <input
          className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
          onChange={(event) => setNewEmail(event.target.value)}
          placeholder="email@agencia.com"
          required
          type="email"
          value={newEmail}
        />
        <select
          className="border border-[#b2b2ae]/40 bg-white px-3 py-2 text-sm"
          onChange={(event) => setNewRole(event.target.value as TeamMemberListItem["role"])}
          value={newRole}
        >
          <option value="AGENT">Agente</option>
          <option value="AGENCY_ADMIN">Admin</option>
        </select>
        <button
          className="bg-[#58624e] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f2fde3] disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          Agregar miembro
        </button>
      </form>

      {error ? <p className="text-sm text-[#a73b21]">{error}</p> : null}

      <div className="divide-y divide-[#b2b2ae]/5 rounded-lg border border-[#e9e8e4] bg-white">
        {members.map((member) => {
          const isEditing = editingUserId === member.id;

          return (
            <div key={member.id} className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  {isEditing ? (
                    <input
                      className="border border-[#b2b2ae]/40 bg-white px-2 py-1 text-sm"
                      onChange={(event) => setEditingName(event.target.value)}
                      value={editingName}
                    />
                  ) : (
                    <h4 className="text-base font-medium text-[#313330]">{member.name}</h4>
                  )}
                  <p className="text-[11px] uppercase tracking-widest text-[#313330]/40">{member.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isEditing ? (
                    <select
                      className="border border-[#b2b2ae]/40 bg-white px-2 py-1 text-xs"
                      onChange={(event) => setEditingRole(event.target.value as TeamMemberListItem["role"])}
                      value={editingRole}
                    >
                      <option value="AGENT">Agente</option>
                      <option value="AGENCY_ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span className="rounded bg-[#efeeea] px-2 py-1 text-[10px] uppercase tracking-widest text-[#5e5f5c]">
                      {roleLabel(member.role)}
                    </span>
                  )}

                  {isEditing ? (
                    <>
                      <button
                        className="text-[10px] font-semibold uppercase tracking-widest text-[#58624e]"
                        disabled={loading}
                        onClick={() => void handleSaveEdit(member.id)}
                        type="button"
                      >
                        Guardar
                      </button>
                      <button
                        className="text-[10px] font-semibold uppercase tracking-widest text-[#5e5f5c]"
                        disabled={loading}
                        onClick={() => setEditingUserId(null)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-[10px] font-semibold uppercase tracking-widest text-[#58624e]"
                        disabled={loading}
                        onClick={() => startEdit(member)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="text-[10px] font-semibold uppercase tracking-widest text-[#a73b21]"
                        disabled={loading}
                        onClick={() => setDeleteConfirmUserId(member.id)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-widest text-[#313330]/45">
                <span>Leads activos: {member.activeLeads}</span>
                <span>Tareas abiertas: {member.openTasks}</span>
                <span>
                  Alta: {new Date(member.createdAt).toLocaleDateString("es-AR", { dateStyle: "medium" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="text-[10px] uppercase tracking-widest text-[#58624e] underline decoration-[#58624e]/30 underline-offset-4"
        disabled={loading}
        onClick={() => void refreshMembers()}
        type="button"
      >
        Actualizar
      </button>

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Eliminar miembro"
        description="Sus leads asignados quedarán sin responsable hasta que reasignes."
        loading={loading && deleteConfirmUserId != null}
        open={deleteConfirmUserId != null}
        title="¿Eliminar este miembro?"
        variant="danger"
        onCancel={() => !loading && setDeleteConfirmUserId(null)}
        onConfirm={() => void confirmDeleteMember()}
      />
    </section>
  );
}
