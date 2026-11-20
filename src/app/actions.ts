"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { pruebas } from "@/db/schema";
import { modelo } from "@/lib/ai";

// Ejemplo completo: llamar a la IA con salida estructurada y guardar el resultado.
// Úsalo como referencia para tus propias funciones.
export async function preguntarALaIA(formData: FormData) {
  const pregunta = String(formData.get("pregunta") ?? "").trim();
  if (!pregunta) return;

  const { output } = await generateText({
    model: modelo,
    output: Output.object({
      schema: z.object({
        respuesta: z.string().describe("Respuesta corta, máximo dos oraciones"),
      }),
    }),
    prompt: `Responde en español, de forma breve: ${pregunta}`,
  });

  await db.insert(pruebas).values({ pregunta, respuesta: output.respuesta });
  revalidatePath("/");
}
