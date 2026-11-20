import type { ResultadoComparacion } from "@/lib/comparacion";
import { Aviso } from "@/components/Aviso";

const NIVEL = {
  cumple: { icono: "✅", texto: "Cumple" },
  parcial: { icono: "🟡", texto: "Parcial" },
  no_cumple: { icono: "❌", texto: "No cumple" },
};

export function VistaComparacion({ r, perfilDesactualizado }: { r: ResultadoComparacion; perfilDesactualizado: boolean }) {
  const color = r.porcentaje >= 70 ? "bg-green-500" : r.porcentaje >= 40 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="space-y-4">
      {perfilDesactualizado && (
        <Aviso tipo="advertencia">Tu perfil cambió desde esta comparación. Vuelve a comparar para actualizarla.</Aviso>
      )}

      <div>
        <p className="text-3xl font-bold">{r.porcentaje}% de compatibilidad</p>
        <div className="mt-1 h-3 w-full rounded bg-neutral-100">
          <div className={`h-3 rounded ${color}`} style={{ width: `${r.porcentaje}%` }} />
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Calculado con código: indispensables valen doble; cumple = 1, parcial = ½, no cumple = 0.
        </p>
      </div>

      <p>{r.resumen}</p>

      {r.evidenciasDudosas.length > 0 && (
        <Aviso tipo="advertencia">
          <p className="font-semibold">⚠️ No encontré en tu perfil la evidencia que dio la IA para:</p>
          <ul className="list-disc pl-5">
            {r.evidenciasDudosas.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>Puede que la IA esté siendo demasiado generosa. Revísalo tú.</p>
        </Aviso>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-2">Requisito</th>
              <th className="p-2">Nivel</th>
              <th className="p-2">Evidencia en tu perfil / Cómo cerrarla</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {r.requisitos.map((q, i) => (
              <tr key={i} className="align-top">
                <td className="p-2">
                  {q.requisito}
                  {q.tipo === "deseable" && <span className="ml-1 text-xs text-neutral-500">(deseable)</span>}
                </td>
                <td className="whitespace-nowrap p-2">
                  {NIVEL[q.nivel].icono} {NIVEL[q.nivel].texto}
                </td>
                <td className="p-2">
                  {q.evidencia && <p className="italic text-neutral-600">“{q.evidencia}”</p>}
                  {q.comoCerrarla && <p>→ {q.comoCerrarla}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {r.queEstudiar.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Qué estudiar</h3>
          <ol className="list-decimal pl-5 text-sm">
            {r.queEstudiar.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
