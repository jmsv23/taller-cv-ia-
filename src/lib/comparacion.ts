import { generateText, Output } from "ai";
import { z } from "zod";
import { modelo } from "@/lib/ai";
import type { Oferta } from "@/lib/ofertas";
import type { Perfil } from "@/lib/perfil";
import { citaVerificable } from "@/lib/texto";

// La IA evalúa requisito por requisito y tiene que CITAR la evidencia.
// Ojo: no le pedimos un porcentaje. El número lo calculamos nosotros con código.
export const ComparacionSchema = z.object({
  requisitos: z.array(
    z.object({
      requisito: z.string().describe("El requisito, tal como viene en la oferta"),
      tipo: z.enum(["indispensable", "deseable"]),
      nivel: z.enum(["cumple", "parcial", "no_cumple"]),
      evidencia: z
        .string()
        .describe("Frase COPIADA del perfil que demuestra el nivel. Cadena vacía si no hay evidencia"),
      comoCerrarla: z
        .string()
        .describe("Si es parcial o no cumple: una acción concreta para cerrar la brecha. Vacía si cumple"),
    }),
  ),
  resumen: z.string().describe("Dos o tres oraciones honestas: ¿vale la pena aplicar y por qué?"),
  queEstudiar: z.array(z.string()).describe("De 1 a 4 temas concretos para estudiar, del más al menos urgente"),
});

export type Comparacion = z.infer<typeof ComparacionSchema>;

// Lo que guardamos: lo que dijo la IA + lo que calculamos/verificamos con código.
export type ResultadoComparacion = Comparacion & {
  porcentaje: number;
  evidenciasDudosas: string[]; // requisitos cuya "evidencia" no aparece en el perfil
};

export async function compararPerfilConOferta(
  perfil: Perfil,
  oferta: Oferta,
  m = modelo,
): Promise<ResultadoComparacion> {
  const { output } = await generateText({
    model: m,
    output: Output.object({ schema: ComparacionSchema }),
    system:
      "Eres una persona de reclutamiento honesta. Comparas un perfil contra una oferta de trabajo. " +
      "Evalúa CADA requisito obligatorio (tipo 'indispensable') y CADA deseable (tipo 'deseable'). " +
      "'cumple' solo si el perfil lo demuestra; 'parcial' si hay algo relacionado; 'no_cumple' si no hay nada. " +
      "La evidencia debe ser texto copiado del perfil, nunca inventado. No seas complaciente. Escribe en español.",
    prompt:
      `PERFIL:\n${JSON.stringify(perfil, null, 2)}\n\n` +
      `REQUISITOS OBLIGATORIOS:\n${oferta.requisitos.map((r) => `- ${r}`).join("\n")}\n\n` +
      `DESEABLES:\n${oferta.deseables.map((r) => `- ${r}`).join("\n") || "(ninguno)"}\n\n` +
      `PUESTO: ${oferta.puesto} en ${oferta.empresa}. ${oferta.resumen}`,
  });

  const textoPerfil = JSON.stringify(perfil);
  const evidenciasDudosas = output.requisitos
    .filter((r) => r.nivel !== "no_cumple" && !citaVerificable(textoPerfil, r.evidencia))
    .map((r) => r.requisito);

  return { ...output, porcentaje: calcularPorcentaje(output.requisitos), evidenciasDudosas };
}

// Indispensables pesan el doble que los deseables. Cumple = 1, parcial = 0.5, no cumple = 0.
export function calcularPorcentaje(requisitos: Comparacion["requisitos"]): number {
  const peso = { indispensable: 2, deseable: 1 };
  const valor = { cumple: 1, parcial: 0.5, no_cumple: 0 };
  let total = 0;
  let obtenido = 0;
  for (const r of requisitos) {
    total += peso[r.tipo];
    obtenido += peso[r.tipo] * valor[r.nivel];
  }
  return total === 0 ? 0 : Math.round((obtenido / total) * 100);
}
