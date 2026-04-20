import { UserRole } from "@prisma/client";

export type Permission =
  | "leads.read"
  | "leads.write"
  | "insights.read"
  | "team.read"
  | "team.manage"
  | "settings.read"
  | "settings.write"
  | "channels.manage"
  | "backoffice.read"
  | "billing.manage"
  | "jobs.manage";

const AGENT_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "leads.read",
  "leads.write",
  "insights.read",
  "team.read",
  "settings.read"
]);

const ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  ...AGENT_PERMISSIONS,
  "team.manage",
  "settings.write",
  "channels.manage",
  "backoffice.read",
  "billing.manage",
  "jobs.manage"
]);

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const source = role === UserRole.AGENCY_ADMIN ? ADMIN_PERMISSIONS : AGENT_PERMISSIONS;
  return source.has(permission);
}
