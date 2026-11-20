<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proyecto del taller «Conecta y automatiza: construye un flujo de trabajo con IA»: rastreador de ofertas y CVs con IA

Estás ayudando a estudiantes de **primer semestre** en un taller. Muchos nunca han programado.

## Cómo trabajar
- Responde y explica **en español**, con palabras sencillas.
- Haz cambios **pequeños** y explica qué cambiaste y por qué antes de seguir.
- Antes de escribir código para algo nuevo, propón primero el diseño (qué datos, qué pantallas) y espera confirmación.
- No instales dependencias nuevas sin preguntar. Lo necesario ya está instalado.
- Todo debe funcionar igual en **Windows, Mac y Linux**: nada de comandos de bash o PowerShell en `package.json`, y usa `path.join` para las rutas.

## El taller
- La guía de los alumnos está en `HITOS.md` (H1 Perfil → H2 Ofertas → H3 Comparación → H4 CV a la medida). Si te piden "el siguiente hito", léela primero.
- Hay CVs y ofertas de ejemplo en `ejemplos/`. Úsalos para probar.
- Los alumnos anotan sus decisiones en `mis-decisiones.md`; si toman una decisión de diseño contigo, sugiéreles anotarla.
- Ayúdales a pensar: cuando la IA del proyecto devuelva datos (evidencias, porcentajes, CVs), propón revisarlos con código en vez de confiar a ciegas.

## Stack
- **Next.js** (App Router) en `src/app`. Usa Server Components y Server Actions (`"use server"`), como en `src/app/actions.ts`.
- **Base de datos**: SQLite local en el archivo `local.db`, con **Drizzle ORM** + `@libsql/client`.
  - Las tablas se definen en `src/db/schema.ts`; la conexión está en `src/db/index.ts` (`import { db } from "@/db"`).
  - Después de cambiar el esquema hay que correr `npm run db:push`.
- **IA**: AI SDK (`ai`) con OpenRouter. El modelo está en `src/lib/ai.ts` (`import { modelo } from "@/lib/ai"`).
  - Para datos estructurados usa `generateText` con `output: Output.object({ schema })` y un esquema de **Zod**. Mira `src/app/actions.ts`.
  - ⚠️ En esta versión del AI SDK **`generateObject` ya no existe**. No lo uses.
  - Los modelos son gratis y modestos: prompts claros, esquemas simples y con `.describe()` en cada campo.
- **Leer PDFs**: `unpdf` (`import { extractText, getDocumentProxy } from "unpdf"`), siempre en el servidor.
- **Estilos**: Tailwind CSS, sin librerías de componentes. La interfaz va en español.

## Comandos
- `npm run dev`: levanta la app en http://localhost:3000
- `npm run db:push`: aplica los cambios de `src/db/schema.ts` a la base de datos.
- `npm run check`: verifica que la computadora esté lista.
- `npm run rescate h2`: salta al punto de control de un hito (guarda antes el trabajo del alumno en otra rama). No lo corras tú: lo decide el alumno.
