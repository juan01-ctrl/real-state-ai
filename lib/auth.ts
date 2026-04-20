import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/server/db";

const DEFAULT_AGENCY_ID = "agency_demo_001";

async function ensureAgency(agencyId: string) {
  const safeId = agencyId.trim() || DEFAULT_AGENCY_ID;

  await db.agency.upsert({
    where: { id: safeId },
    update: {},
    create: {
      id: safeId,
      name: safeId === DEFAULT_AGENCY_ID ? "Agencia Demo" : `Agencia ${safeId}`,
      slug: safeId
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
  });

  return safeId;
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql"
  }),
  basePath: "/api/auth",
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true
  },
  user: {
    modelName: "User",
    additionalFields: {
      agencyId: {
        type: "string",
        required: false,
        defaultValue: DEFAULT_AGENCY_ID
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "AGENT"
      }
    }
  },
  session: {
    modelName: "Session"
  },
  account: {
    modelName: "Account"
  },
  verification: {
    modelName: "Verification"
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const agencyId = await ensureAgency(String(user.agencyId ?? DEFAULT_AGENCY_ID));
          return {
            data: {
              ...user,
              agencyId,
              role: String(user.role ?? "AGENT")
            }
          };
        }
      }
    }
  }
});

export { DEFAULT_AGENCY_ID };
