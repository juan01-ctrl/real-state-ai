/**
 * Crea un operador con email+contraseña.
 *
 * Por defecto usa la agencia demo (`agency_demo_001`), que puede tener leads de prueba si alguien
 * generó datos demo. Para una cuenta en un tenant vacío (solo filas Agency + User + Account):
 *
 *   npm run create-account -- --new-agency --email ops@tu-dominio.com --password 'TuPass123!' --name "Nombre"
 *   CREATE_ACCOUNT_NEW_AGENCY=1 CREATE_ACCOUNT_PASSWORD='...' npm run create-account
 *
 * Opcional: `--agency-name "Mi inmobiliaria"` y/o `--agency-id agency_mi_id` (con --new-agency no puede ser agency_demo_001).
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

function wantsNewAgency(): boolean {
  return (
    process.argv.includes("--new-agency") ||
    process.env.CREATE_ACCOUNT_NEW_AGENCY === "1" ||
    process.env.CREATE_ACCOUNT_NEW_AGENCY === "true"
  );
}

async function ensureAgency(
  agencyId: string,
  options?: { displayName?: string; timezone?: string }
) {
  const slug = agencyId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await db.agency.upsert({
    where: { id: agencyId },
    update: {},
    create: {
      id: agencyId,
      name:
        options?.displayName ??
        (agencyId === DEFAULT_AGENCY_ID ? "Agencia Demo" : `Agencia ${agencyId}`),
      slug: slug || `agencia-${agencyId.slice(0, 12)}`,
      timezone: options?.timezone ?? "America/Argentina/Buenos_Aires"
    }
  });
}

async function main() {
  const emailRaw =
    parseArg("--email") ?? process.env.CREATE_ACCOUNT_EMAIL ?? "demo.operator@aesthete.local";
  const password = parseArg("--password") ?? process.env.CREATE_ACCOUNT_PASSWORD;
  const name = parseArg("--name") ?? process.env.CREATE_ACCOUNT_NAME ?? "Operador demo";
  const newAgency = wantsNewAgency();
  const explicitAgencyId = parseArg("--agency-id") ?? process.env.CREATE_ACCOUNT_AGENCY_ID;

  let agencyId: string;
  if (newAgency) {
    agencyId = explicitAgencyId ?? `agency_${randomUUID()}`;
    if (agencyId === DEFAULT_AGENCY_ID) {
      console.error(
        "Con --new-agency no podés usar agency_demo_001. Omití --agency-id para generar un id nuevo, o elegí otro id."
      );
      process.exit(1);
    }
  } else {
    agencyId = explicitAgencyId ?? DEFAULT_AGENCY_ID;
  }

  const agencyDisplayName =
    parseArg("--agency-name") ??
    process.env.CREATE_ACCOUNT_AGENCY_NAME ??
    (newAgency ? "Agencia nueva" : undefined);

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

  await ensureAgency(agencyId, {
    displayName: agencyDisplayName,
    timezone: "America/Argentina/Buenos_Aires"
  });
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
  const agencyNote = newAgency
    ? "tenant nuevo (sin leads ni datos demo por defecto)"
    : agencyId === DEFAULT_AGENCY_ID
      ? "demo / puede compartir datos con otros usuarios demo"
      : "custom";
  console.log(`  Agencia: ${agencyId} (${agencyNote})`);
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
