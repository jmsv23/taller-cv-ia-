import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taller CV con IA",
  description: "Rastreador de ofertas y CVs a la medida, construido con IA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
