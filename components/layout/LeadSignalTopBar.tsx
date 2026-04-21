"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LEADSIGNAL_NAV_ITEMS, leadsignalNavHref, type LeadSignalNavLabel } from "@/lib/nav/leadsignal-app-nav";

interface LeadSignalTopBarProps {
  title?: string;
}

const avatarSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_771vXlGMjwmvhsyeN9o_6udq1QJBjX6BZzQPmbcCbGAu5F6iISyd4PvMEjjuYLdtn9opFSRkEdQZmpwVyN54pH7BBn3DwELjhq87FKZ8RSDYf5Jx2v_7g9U5IEfwrdsUso8QgakdgFt9QRFowyIpzp9EUctH_1iIyq-c0EL8KGtU4TmWaABitpBE_cACYJztBK7YUjbu7CX0vqfAZoSs8BfJzvcVqRdCTxUS6q-sTqiM9CDXxnQpMzp9WrFiyXNqAjIVn4JFKGG7";

function inferTitle(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Tablero";
  if (pathname.startsWith("/leads")) return "Bandeja de Leads";
  if (pathname.startsWith("/team")) return "Centro de Comando del Equipo";
  if (pathname.startsWith("/lead")) return "Centro de Comando del Equipo";
  if (pathname.startsWith("/opportunities")) return "Oportunidades Estratégicas";
  if (pathname.startsWith("/insights") || pathname.startsWith("/analytics")) return "Analítica operativa";
  if (pathname.startsWith("/properties")) return "Inteligencia de Propiedades";
  if (pathname.startsWith("/settings")) return "Configuración de la Agencia";
  if (pathname.startsWith("/backoffice")) return "Backoffice Operativo";
  return "LeadSignal";
}

function activeLabelForPath(pathname: string): LeadSignalNavLabel | null {
  const p = pathname || "/";
  if (p.startsWith("/dashboard")) return "Tablero";
  if (p.startsWith("/leads")) return "Leads";
  if (p.startsWith("/opportunities")) return "Oportunidades";
  if (p.startsWith("/insights") || p.startsWith("/analytics")) return "Analítica";
  if (p.startsWith("/properties")) return "Propiedades";
  if (p.startsWith("/team")) return "Equipo";
  if (p.startsWith("/settings")) return "Configuración";
  if (p.startsWith("/backoffice")) return "Backoffice";
  return null;
}

export function LeadSignalTopBar({ title }: LeadSignalTopBarProps) {
  const pathname = usePathname();
  const resolvedTitle = title ?? inferTitle(pathname ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  const activeNav = activeLabelForPath(pathname ?? "");

  return (
    <>
      <header className="sticky top-0 z-40 flex min-w-0 items-center justify-between gap-3 bg-[#fbf9f6] px-4 py-5 shadow-[0_25px_50px_rgba(239,238,234,0.55)] sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <div className="flex min-w-0 items-center space-x-3 sm:space-x-4">
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            className="material-symbols-outlined shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[#58624e] lg:hidden"
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? "close" : "menu"}
          </button>
          <h2
            className="min-w-0 truncate text-lg italic tracking-tight text-[#313330] sm:text-2xl"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {resolvedTitle}
          </h2>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-[#efeeea] sm:h-10 sm:w-10">
            <img alt="Avatar del operador" className="h-full w-full object-cover" src={avatarSrc} />
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/35"
            type="button"
            onClick={close}
          />
          <nav
            aria-label="Navegación principal"
            className="absolute left-0 top-0 flex h-full w-[min(100vw-3rem,20rem)] flex-col bg-[#efeeea] px-5 py-8 shadow-xl"
          >
            <p className="mb-6 text-[10px] uppercase tracking-widest text-[#58624e]">Menú</p>
            <ul className="flex flex-1 flex-col gap-1">
              {LEADSIGNAL_NAV_ITEMS.map((item) => {
                const href = leadsignalNavHref(item.href);
                const isActive = activeNav === item.label;
                return (
                  <li key={item.href}>
                    <Link
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                        isActive
                          ? "bg-[#fbf9f6] font-medium text-[#313330]"
                          : "text-[#313330]/60 hover:bg-[#fbf9f6]/70 hover:text-[#58624e]"
                      }`}
                      href={href}
                      onClick={close}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto space-y-2 border-t border-[#b2b2ae]/20 pt-6">
              <a
                className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-[#313330]/50"
                href="https://wa.me/5491159570977?text=Hola%2C%20necesito%20ayuda%20con%20LeadSignal."
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">help</span>
                Ayuda
              </a>
              <Link
                className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-[#313330]/50"
                href="/sign-out"
                onClick={close}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Salir
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
