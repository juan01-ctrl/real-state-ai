"use client";

import { usePathname } from "next/navigation";

interface AestheteTopBarProps {
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
  return "Aesthete AI";
}

export function AestheteTopBar({ title }: AestheteTopBarProps) {
  const pathname = usePathname();
  const resolvedTitle = title ?? inferTitle(pathname ?? "");

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-[#fbf9f6] px-4 py-5 shadow-[0_25px_50px_rgba(239,238,234,0.55)] sm:px-8 sm:py-6 lg:px-10 lg:py-8">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <span className="material-symbols-outlined cursor-pointer text-[#58624e]">menu</span>
        <h2 className="text-lg italic tracking-tight text-[#313330] sm:text-2xl" style={{ fontFamily: "'Noto Serif', serif" }}>
          {resolvedTitle}
        </h2>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-6">
        <div className="hidden space-x-4 text-stone-400 sm:flex">
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-[#58624e]">notifications</span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-[#58624e]">search</span>
        </div>
        <div className="h-8 w-8 overflow-hidden rounded-full bg-[#efeeea] sm:h-10 sm:w-10">
          <img alt="Avatar del operador" className="h-full w-full object-cover" src={avatarSrc} />
        </div>
      </div>
    </header>
  );
}
