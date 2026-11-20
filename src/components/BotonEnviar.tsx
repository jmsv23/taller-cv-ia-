"use client";

import { useFormStatus } from "react-dom";

// Botón que se desactiva y cambia de texto mientras el formulario se procesa.
// Los modelos gratis pueden tardar 10-60 segundos: sin esto, la gente da clic 5 veces.
export function BotonEnviar({
  children,
  pendiente = "Pensando…",
  variante = "principal",
}: {
  children: React.ReactNode;
  pendiente?: string;
  variante?: "principal" | "secundario" | "peligro";
}) {
  const { pending } = useFormStatus();
  const estilos = {
    principal: "bg-black text-white hover:bg-neutral-800",
    secundario: "border border-neutral-300 bg-white hover:bg-neutral-100",
    peligro: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
  }[variante];
  return (
    <button
      disabled={pending}
      className={`rounded px-4 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-60 ${estilos}`}
    >
      {pending ? pendiente : children}
    </button>
  );
}
