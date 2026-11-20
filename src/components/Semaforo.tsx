import { ESTADOS, type Estado } from "@/lib/ofertas";

export function Semaforo({ estado, conTexto = true }: { estado: Estado; conTexto?: boolean }) {
  const { etiqueta, color } = ESTADOS[estado];
  return (
    <span className="inline-flex items-center gap-2 text-sm" title={etiqueta}>
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      {conTexto && etiqueta}
    </span>
  );
}
