import type { Metadata } from "next";
import "./globals.css";
import { Navegacion } from "@/components/Navegacion";

export const metadata: Metadata = {
  title: "Conecta y automatiza: construye un flujo de trabajo con IA",
  description: "Rastreador de ofertas y CVs a la medida, construido con IA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navegacion />
        {children}
      </body>
    </html>
  );
}
