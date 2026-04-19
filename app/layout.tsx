import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real State AI | Bandeja de leads",
  description: "Bandeja de leads y espacio de calificación para inmobiliarias"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
