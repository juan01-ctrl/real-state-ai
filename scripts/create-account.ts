/**
 * Crea un operador con email+contraseña en la agencia demo (mismos datos que el seed).
 * Uso:
 *   npm run create-account -- --email demo@tu-dominio.com --password 'TuPass123!' --name "Nombre"
 *   CREATE_ACCOUNT_PASSWORD='TuPass123!' npm run create-account
 *
 * Requiere DATABASE_URL y el mismo algoritmo de hash que Better Auth (@better-auth/utils/password).
 */
import { hashPassword } from "@better-auth/utils/password";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { DEFAULT_AGENCY_ID } from "../lib/auth";
import { db } from "../lib/server/db";

function parseArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function ensureAgency(agencyId: string) {
  await db.agency.upsert({
    where: { id: agencyId },
    update: {},
    create: {
      id: agencyId,
      name: agencyId === DEFAULT_AGENCY_ID ? "Agencia Demo" : `Agencia ${agencyId}`,
      slug: agencyId
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
  });
}

async function main() {
  const emailRaw =
    parseArg("--email") ?? process.env.CREATE_ACCOUNT_EMAIL ?? "demo.operator@aesthete.local";
  const password = parseArg("--password") ?? process.env.CREATE_ACCOUNT_PASSWORD;
  const name = parseArg("--name") ?? process.env.CREATE_ACCOUNT_NAME ?? "Operador demo";
  const agencyId = parseArg("--agency-id") ?? process.env.CREATE_ACCOUNT_AGENCY_ID ?? DEFAULT_AGENCY_ID;

  if (!password || password.length < 8) {
    console.error(
      "Definí una contraseña de al menos 8 caracteres: --password '...' o variable CREATE_ACCOUNT_PASSWORD."
    );
    process.exit(1);
  }

  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) {
    console.error("Email inválido.");
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Ya existe un usuario con email ${email} (id ${existing.id}).`);
    process.exit(1);
  }

  await ensureAgency(agencyId);
  const hashed = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      name: name.trim() || "Operador",
      agencyId,
      role: UserRole.AGENT,
      emailVerified: false
    }
  });

  await db.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log("Usuario creado.");
  console.log(`  Agencia: ${agencyId} (${agencyId === DEFAULT_AGENCY_ID ? "demo / seed" : "custom"})`);
  console.log(`  Email:   ${email}`);
  console.log(`  Nombre:  ${user.name}`);
  console.log(`  Id:      ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
