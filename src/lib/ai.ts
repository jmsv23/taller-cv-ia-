import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// La key y el modelo viven en .env.local (los escribe `npm run check` por ti).
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const MODELO_POR_DEFECTO = "nvidia/nemotron-3.5-super-vl:free";

// Úsalo así:
//   import { generateText, Output } from "ai";
//   import { z } from "zod";
//   const { output } = await generateText({
//     model: modelo,
//     output: Output.object({ schema: z.object({ ... }) }),
//     prompt: "...",
//   });
export const modelo = openrouter(process.env.AI_MODEL ?? MODELO_POR_DEFECTO);
