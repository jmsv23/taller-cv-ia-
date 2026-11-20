import { generateText, Output } from "ai";
import { z } from "zod";
import { modelo } from "@/lib/ai";

// ¿Qué datos de una oferta importan? Esto es lo que decidimos guardar.
// Todo lo demás (historia de la empresa, frases de marketing) es ruido.
export const OfertaSchema = z.object({
  empresa: z.string().describe("Nombre de la empresa; 'No especificada' si no aparece"),
  puesto: z.string().describe("Nombre del puesto"),
  ubicacion: z.string().describe("Ciudad; cadena vacía si no aparece"),
  modalidad: z.enum(["presencial", "hibrido", "remoto", "no_especificada"]),
  sueldo: z.string().describe("Sueldo o apoyo económico tal como aparece; cadena vacía si no aparece"),
  resumen: z.string().describe("De qué se trata el puesto, en una o dos oraciones"),
  requisitos: z.array(z.string()).describe("Requisitos OBLIGATORIOS, uno por elemento"),
  deseables: z
    .array(z.string())
    .describe("Requisitos opcionales: 'deseable', 'suma puntos', 'plus'. Lista vacía si no hay"),
  responsabilidades: z.array(z.string()).describe("Qué hará la persona en el puesto"),
  palabrasClave: z
    .array(z.string())
    .describe("Herramientas, tecnologías y habilidades concretas que menciona la oferta, de 1 a 3 palabras cada una"),
});

export type Oferta = z.infer<typeof OfertaSchema>;

export async function analizarOferta(texto: string, m = modelo): Promise<Oferta> {
  const { output } = await generateText({
    model: m,
    output: Output.object({ schema: OfertaSchema }),
    system:
      "Extraes los datos importantes de ofertas de trabajo. Copia la información tal como aparece, sin inventar. " +
      "Separa con cuidado lo obligatorio de lo deseable. Escribe en español.",
    prompt: `Oferta de trabajo:\n\n"""\n${texto}\n"""`,
  });
  return output;
}

// ── El semáforo de cada aplicación ──────────────────────────
export const ESTADOS = {
  sin_respuesta: { etiqueta: "Sin respuesta", color: "bg-neutral-400" },
  mas_informacion: { etiqueta: "Respondieron: piden más información", color: "bg-yellow-400" },
  entrevista: { etiqueta: "Entrevista programada", color: "bg-green-500" },
  declinada: { etiqueta: "Declinada", color: "bg-red-500" },
} as const;

export type Estado = keyof typeof ESTADOS;
export const LISTA_ESTADOS = Object.keys(ESTADOS) as Estado[];

export const MODALIDADES = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "Remoto",
  no_especificada: "Modalidad no especificada",
} as const;

// ── Reto extra: leer la oferta desde un link ────────────────
// Descargamos la página y le quitamos el HTML. Muchas bolsas de trabajo
// (LinkedIn, por ejemplo) bloquean esto o cargan la oferta con JavaScript:
// por eso pegar el texto sigue siendo el camino principal.
export async function textoDeUrl(url: string): Promise<string> {
  const respuesta = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (rastreador de CVs del taller)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!respuesta.ok) throw new Error(`La página respondió con error ${respuesta.status}.`);
  const html = await respuesta.text();
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 15_000); // los modelos gratis tienen un límite de texto
}
