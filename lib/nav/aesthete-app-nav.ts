/**
 * Navegación principal del app shell (sidebar + menú móvil).
 */
export const AESTHETE_NAV_ITEMS = [
  { icon: "dashboard", label: "Tablero", href: "/dashboard" },
  { icon: "person_search", label: "Leads", href: "/leads" },
  { icon: "analytics", label: "Oportunidades", href: "/opportunities" },
  { icon: "insights", label: "Analítica", href: "/insights" },
  { icon: "domain", label: "Propiedades", href: "/properties" },
  { icon: "group", label: "Equipo", href: "/team" },
  { icon: "settings", label: "Configuración", href: "/settings" }
] as const;

export type AestheteNavLabel = (typeof AESTHETE_NAV_ITEMS)[number]["label"];

export function aestheteNavHref(href: string): string {
  return href;
}
