import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth, DEFAULT_AGENCY_ID } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/server/rbac";

export interface SessionContext {
  userId: string;
  agencyId: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireSessionContext(options?: { redirectTo?: string }): Promise<SessionContext> {
  const session = await getServerSession();

  if (!session?.user) {
    if (options?.redirectTo) {
      redirect(options.redirectTo);
    }

    throw new Error("UNAUTHORIZED");
  }

  const user = session.user as {
    id: string;
    email?: string | null;
    name?: string | null;
    agencyId?: string | null;
    role?: string | null;
  };

  const agencyId = user.agencyId?.trim() || DEFAULT_AGENCY_ID;

  return {
    userId: user.id,
    agencyId,
    email: user.email ?? "",
    name: user.name ?? "",
    role: user.role === "AGENCY_ADMIN" ? UserRole.AGENCY_ADMIN : UserRole.AGENT
  };
}

export async function requirePermission(permission: Permission, options?: { redirectTo?: string }): Promise<SessionContext> {
  const ctx = await requireSessionContext(options);
  if (!hasPermission(ctx.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}
