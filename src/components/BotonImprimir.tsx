"use client";

// El navegador convierte el HTML en PDF: Imprimir → "Guardar como PDF".
export function BotonImprimir() {
  return (
    <button onClick={() => window.print()} className="rounded bg-black px-4 py-2 text-sm font-medium text-white">
      🖨️ Imprimir / Guardar como PDF
    </button>
  );
}
