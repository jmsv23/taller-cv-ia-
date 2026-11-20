import { generateText, Output } from "ai";
import { z } from "zod";
import { modelo } from "@/lib/ai";
import { apareceEn } from "@/lib/texto";

// ─────────────────────────────────────────────────────────────
// El esquema es el CONTRATO con la IA: le dice exactamente qué
// datos queremos y en qué forma. Si un campo no está aquí, la IA
// no lo va a llenar. Los .describe() son instrucciones por campo.
// ─────────────────────────────────────────────────────────────
export const PerfilSchema = z.object({
  nombre: z.string().describe("Nombre completo de la persona"),
  titular: z
    .string()
    .describe("Una línea que describe a la persona, ej. 'Estudiante de Ingeniería en Sistemas'"),
  email: z.string().describe("Correo electrónico; cadena vacía si no aparece"),
  telefono: z.string().describe("Teléfono; cadena vacía si no aparece"),
  ubicacion: z.string().describe("Ciudad o estado; cadena vacía si no aparece"),
  resumen: z.string().describe("Resumen profesional de 2 a 4 oraciones"),
  habilidades: z
    .array(z.string())
    .describe("Habilidades concretas: herramientas, lenguajes, técnicas. Una por elemento"),
  experiencia: z
    .array(
      z.object({
        puesto: z.string(),
        organizacion: z.string().describe("Empresa, negocio u organización"),
        periodo: z.string().describe("Fechas tal como aparecen, ej. '2024 - 2025'"),
        logros: z.array(z.string()).describe("Qué hizo o logró, una idea por elemento"),
      }),
    )
    .describe("Trabajos, prácticas, voluntariados; incluye trabajos de medio tiempo"),
  educacion: z.array(
    z.object({
      titulo: z.string(),
      institucion: z.string(),
      periodo: z.string(),
    }),
  ),
  proyectos: z.array(
    z.object({
      nombre: z.string(),
      descripcion: z.string(),
      tecnologias: z.array(z.string()),
    }),
  ),
  idiomas: z.array(z.object({ idioma: z.string(), nivel: z.string() })),
});

export type Perfil = z.infer<typeof PerfilSchema>;

// Paso 1: texto libre de un CV → perfil estructurado.
export async function extraerPerfil(textoCv: string, m = modelo): Promise<Perfil> {
  const { output } = await generateText({
    model: m,
    output: Output.object({ schema: PerfilSchema }),
    system:
      "Eres un asistente que convierte currículums en datos estructurados. " +
      "Copia la información tal como viene. NO inventes datos: si algo no aparece, deja el campo vacío o la lista vacía. " +
      "Escribe en español.",
    prompt: `Este es el texto de un CV:\n\n"""\n${textoCv}\n"""`,
  });
  return output;
}

// Paso 2: revisar el perfil y proponer mejoras concretas.
export const RevisionSchema = z.object({
  calificacion: z.number().int().min(1).max(10).describe("Qué tan listo está el perfil, de 1 a 10"),
  sugerencias: z
    .array(
      z.object({
        seccion: z.enum(["resumen", "experiencia", "habilidades", "proyectos", "educacion", "general"]),
        problema: z.string().describe("Qué está mal o débil, citando el texto actual"),
        sugerencia: z.string().describe("Cómo mejorarlo, con un ejemplo de redacción"),
      }),
    )
    .describe("Entre 3 y 6 sugerencias, de la más importante a la menos importante"),
});

export type Revision = z.infer<typeof RevisionSchema>;

export async function revisarPerfil(perfil: Perfil, m = modelo): Promise<Revision> {
  const { output } = await generateText({
    model: m,
    output: Output.object({ schema: RevisionSchema }),
    system:
      "Eres una persona de reclutamiento que ayuda a estudiantes universitarios a mejorar su CV. " +
      "Buscas: logros vagos sin resultados, falta de verbos de acción, habilidades genéricas ('responsable', 'trabajo en equipo') " +
      "en lugar de concretas, y un resumen que no dice qué ofrece la persona. " +
      "Nunca sugieras inventar experiencia: si falta un dato (como un número), sugiere que la persona lo averigüe. Escribe en español.",
    prompt: `Revisa este perfil:\n${JSON.stringify(perfil, null, 2)}`,
  });
  return output;
}

// Paso 3: aplicar las sugerencias y devolver un perfil mejorado.
export async function mejorarPerfil(perfil: Perfil, revision: Revision, m = modelo): Promise<Perfil> {
  const { output } = await generateText({
    model: m,
    output: Output.object({ schema: PerfilSchema }),
    system:
      "Mejoras la redacción de perfiles profesionales. Reglas estrictas: " +
      "1) No agregues empresas, puestos, escuelas, fechas, números ni habilidades que no estén en el perfil original. " +
      "2) Sí puedes reescribir con verbos de acción, ordenar mejor y hacer el resumen más claro. " +
      "3) Mantén todos los datos de contacto igual. Escribe en español.",
    prompt:
      `Perfil original:\n${JSON.stringify(perfil, null, 2)}\n\n` +
      `Sugerencias a aplicar:\n${revision.sugerencias.map((s) => `- [${s.seccion}] ${s.sugerencia}`).join("\n")}`,
  });
  return output;
}

// ─────────────────────────────────────────────────────────────
// Revisión con CÓDIGO: ¿la IA metió algo que no estaba en el original?
// No le preguntamos a la IA si inventó; lo comprobamos nosotros.
// ─────────────────────────────────────────────────────────────
export function detectarInvenciones(nuevo: Perfil, original: Perfil): string[] {
  const textoOriginal = JSON.stringify(original);
  const alertas: string[] = [];

  for (const h of nuevo.habilidades)
    if (!apareceEn(textoOriginal, h)) alertas.push(`Habilidad que no estaba en tu perfil: "${h}"`);

  for (const e of nuevo.experiencia)
    if (e.organizacion && !apareceEn(textoOriginal, e.organizacion))
      alertas.push(`Organización que no estaba en tu perfil: "${e.organizacion}"`);

  for (const e of nuevo.educacion)
    if (e.institucion && !apareceEn(textoOriginal, e.institucion))
      alertas.push(`Escuela que no estaba en tu perfil: "${e.institucion}"`);

  // Números nuevos (porcentajes, cantidades) suelen ser inventados.
  const numerosOriginales = new Set(textoOriginal.match(/\d+/g) ?? []);
  const textoNuevo = JSON.stringify({ ...nuevo, email: "", telefono: "" });
  for (const n of new Set(textoNuevo.match(/\d+/g) ?? []))
    if (!numerosOriginales.has(n)) alertas.push(`Número que no estaba en tu perfil: "${n}"`);

  return alertas;
}
