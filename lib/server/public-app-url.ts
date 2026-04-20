/** Origen público de la app (webhooks, enlaces). Sin barra final. */
export function getPublicAppOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!raw) return "";
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProto.replace(/\/$/, "");
}
