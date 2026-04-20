import { db } from "@/lib/server/db";

export interface AgencyOperator {
  id: string;
  name: string;
  email: string;
}

export async function getAgencyOperators(agencyId: string): Promise<AgencyOperator[]> {
  const users = await db.user.findMany({
    where: { agencyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true }
  });
  return users;
}
