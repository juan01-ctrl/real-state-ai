interface LeadSignalFooterProps {
  variant: "editorial" | "atelier";
  className?: string;
}

export function LeadSignalFooter({ variant, className }: LeadSignalFooterProps) {
  const isEditorial = variant === "editorial";
  const links = isEditorial
    ? [
        { label: "Política de Privacidad", href: "/#diferenciacion" },
        { label: "Términos del Servicio", href: "/#diferenciacion" },
        { label: "Prensa", href: "/insights" },
        {
          label: "Contacto",
          href: "https://wa.me/5491159570977?text=Hola%2C%20quiero%20contactar%20al%20equipo%20de%20LeadSignal."
        }
      ]
    : [
        { label: "Infraestructura", href: "/#infraestructura" },
        { label: "Privacidad", href: "/#diferenciacion" },
        { label: "Términos", href: "/#diferenciacion" },
        {
          label: "Contacto",
          href: "https://wa.me/5491159570977?text=Hola%2C%20quiero%20contactar%20al%20equipo%20de%20LeadSignal."
        }
      ];

  return (
    <footer
      className={`w-full border-t border-stone-200 bg-[#efeeea] px-4 py-14 sm:px-8 sm:py-20 lg:px-12 ${
        className ?? ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row md:items-center">
        <div className="flex flex-col items-start gap-2">
          <span
            className={`${isEditorial ? "text-2xl italic normal-case text-stone-800" : "text-lg uppercase tracking-widest text-[#313330]"}`}
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {isEditorial ? "LeadSignal" : "LEADSIGNAL"}
          </span>
          <p className={`${isEditorial ? "text-[11px] tracking-[0.15em] text-stone-500" : "text-[12px] text-[#313330]/40"} uppercase`}>
            {isEditorial
              ? "© 2024 LeadSignal. Visibilidad y acción sobre tu embudo de ventas."
              : "© 2024 LeadSignal. Infraestructura de ventas para inmobiliarias."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-x-8 md:flex-nowrap md:justify-center md:gap-x-8">
          {links.map((item) => (
            <a
              key={item.label}
              className={`${isEditorial ? "text-[11px] tracking-[0.15em] text-stone-500" : "text-[12px] text-[#313330]/40"} shrink-0 whitespace-nowrap uppercase transition-colors hover:text-[#58624e]`}
              href={item.href}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={item.href.startsWith("http") ? "_blank" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
