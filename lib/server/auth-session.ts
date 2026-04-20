import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, DEFAULT_AGENCY_ID } from "@/lib/auth";

export interface SessionContext {
  userId: string;
  agencyId: string;
  email: string;
  name: string;
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
  };

  const agencyId = user.agencyId?.trim() || DEFAULT_AGENCY_ID;

  return {
    userId: user.id,
    agencyId,
    email: user.email ?? "",
    name: user.name ?? ""
  };
}
