import Link from "next/link";

type SidebarItem = {
  icon: string;
  label: "Tablero" | "Leads" | "Oportunidades" | "Insights" | "Propiedades" | "Equipo" | "Configuración";
  href: string;
};

interface AestheteSidebarProps {
  active: SidebarItem["label"];
  agencyId?: string;
}

const baseItems: SidebarItem[] = [
  { icon: "dashboard", label: "Tablero", href: "/dashboard" },
  { icon: "person_search", label: "Leads", href: "/leads" },
  { icon: "analytics", label: "Oportunidades", href: "/opportunities" },
  { icon: "insights", label: "Insights", href: "/insights" },
  { icon: "domain", label: "Propiedades", href: "/properties" },
  { icon: "group", label: "Equipo", href: "/team" },
  { icon: "settings", label: "Configuración", href: "/settings" }
];

function withAgency(href: string, agencyId?: string) {
  if (!agencyId || href === "#" || href === "/dashboard") return href;
  return `${href}?agencyId=${agencyId}`;
}

function MaterialIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
        fontSize: "20px"
      }}
    >
      {icon}
    </span>
  );
}

export function AestheteSidebar({ active, agencyId }: AestheteSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col space-y-8 bg-[#efeeea] px-6 py-10 lg:flex">
      <div className="mb-6 flex flex-col">
        <span className="text-lg uppercase tracking-widest text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
          AESTHETE AI
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#58624e]">Atelier digital</span>
      </div>

      <nav className="flex-1 space-y-2">
        {baseItems.map((item) => {
          const isActive = item.label === active;
          const href = withAgency(item.href, agencyId);

          return (
            <Link
              key={item.label}
              className={`flex items-center gap-3 px-2 py-3 transition-all ${
                isActive
                  ? "border-l-4 border-[#58624e] bg-[#fbf9f6] text-[#313330]"
                  : "text-[#313330]/40 hover:bg-[#fbf9f6]/50 hover:text-[#58624e]"
              }`}
              href={href}
            >
              <MaterialIcon icon={item.icon} />
              <span className="text-[11px] uppercase tracking-[0.1em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-[#b2b2ae]/10 pt-6">
        <a
          className="flex items-center gap-3 px-2 text-[#313330]/40 transition-all hover:text-[#58624e]"
          href="https://wa.me/5491159570977?text=Hola%2C%20necesito%20ayuda%20con%20Aesthete%20AI."
          rel="noopener noreferrer"
          target="_blank"
        >
          <MaterialIcon icon="help" />
          <span className="text-[11px] uppercase tracking-[0.1em]">Ayuda</span>
        </a>
        <Link className="flex items-center gap-3 px-2 text-[#313330]/40 transition-all hover:text-[#58624e]" href="/sign-out">
          <MaterialIcon icon="logout" />
          <span className="text-[11px] uppercase tracking-[0.1em]">Salir</span>
        </Link>
      </div>
    </aside>
  );
}
