import { generateText, Output } from "ai";
import { modelo } from "@/lib/ai";
import type { ResultadoComparacion } from "@/lib/comparacion";
import type { Oferta } from "@/lib/ofertas";
import { PerfilSchema, detectarInvenciones, type Perfil } from "@/lib/perfil";
import { apareceEn } from "@/lib/texto";

// Un CV a la medida tiene la MISMA forma que el perfil: solo cambia qué se incluye,
// en qué orden y cómo se redacta. Por eso reutilizamos el mismo esquema.
export type Cv = Perfil;

export type ResultadoCv = {
  cv: Cv;
  alertas: string[]; // posibles invenciones (comparando contra el perfil)
  cobertura: { incluidas: string[]; faltantes: string[] }; // palabras clave de la oferta que sí/no aparecen
};

export async function generarCv(
  perfil: Perfil,
  oferta: Oferta,
  comparacion: ResultadoComparacion | null,
  m = modelo,
): Promise<ResultadoCv> {
  const fortalezas = comparacion?.requisitos.filter((r) => r.nivel !== "no_cumple").map((r) => r.requisito) ?? [];

  const { output: cv } = await generateText({
    model: m,
    output: Output.object({ schema: PerfilSchema }),
    system:
      "Adaptas CVs a una oferta de trabajo para que pasen filtros ATS y lleguen a entrevista. Reglas: " +
      "1) RESALTAR sí, FABRICAR nunca: no agregues habilidades, empresas, escuelas, fechas ni números que no estén en el perfil. " +
      "2) Ordena experiencia, proyectos y habilidades poniendo primero lo más relevante para la oferta; puedes omitir lo irrelevante. " +
      "3) Usa las mismas palabras que la oferta SOLO cuando describan algo que la persona sí hizo. " +
      "4) Adapta el titular y el resumen al puesto. Logros con verbos de acción, una idea por elemento. " +
      "5) Mantén los datos de contacto idénticos. Escribe en español.",
    prompt:
      `PERFIL (la única fuente de verdad):\n${JSON.stringify(perfil, null, 2)}\n\n` +
      `OFERTA: ${oferta.puesto} en ${oferta.empresa}\n` +
      `Requisitos: ${oferta.requisitos.join("; ")}\n` +
      `Deseables: ${oferta.deseables.join("; ")}\n` +
      `Palabras clave: ${oferta.palabrasClave.join(", ")}\n` +
      (fortalezas.length ? `\nFortalezas detectadas (resáltalas): ${fortalezas.join("; ")}` : ""),
  });

  // Revisiones con código, no con IA:
  const alertas = detectarInvenciones(cv, perfil);
  const textoCv = JSON.stringify(cv);
  const incluidas = oferta.palabrasClave.filter((p) => apareceEn(textoCv, p));
  const faltantes = oferta.palabrasClave.filter((p) => !apareceEn(textoCv, p));

  return { cv, alertas, cobertura: { incluidas, faltantes } };
}
