import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import type { Perfil, Revision } from "@/lib/perfil";
import type { Estado, Oferta } from "@/lib/ofertas";

// Aquí van las tablas de tu app.
//
// Pregunta para pensar antes de pedirle código a opencode:
// ¿qué datos necesitas guardar para que la IA pueda trabajar con ellos?
//
// Después de cambiar este archivo corre:  npm run db:push

// Tabla de ejemplo: guarda las preguntas que le haces a la IA en la página de inicio.
// Puedes borrarla cuando tengas tus propias tablas.
export const pruebas = sqliteTable("pruebas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pregunta: text("pregunta").notNull(),
  respuesta: text("respuesta").notNull(),
  creadoEn: integer("creado_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── H1 · Perfil ─────────────────────────────────────────────
// Guardamos cada versión del perfil (del CV, mejorada por IA o editada a mano).
// El perfil actual es la versión más reciente. Así se puede "deshacer".
export const perfiles = sqliteTable("perfiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  datos: text("datos", { mode: "json" }).$type<Perfil>().notNull(),
  origen: text("origen", { enum: ["cv", "mejora_ia", "edicion"] }).notNull(),
  textoCv: text("texto_cv"), // el texto original del CV, por si queremos volver a extraer
  revision: text("revision", { mode: "json" }).$type<Revision>(), // última revisión de la IA
  alertas: text("alertas", { mode: "json" }).$type<string[]>(), // posibles invenciones
  creadoEn: integer("creado_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── H2 · Ofertas y aplicaciones ─────────────────────────────
// Lo que usamos para buscar u ordenar va en columnas; las listas, en JSON.
export const aplicaciones = sqliteTable("aplicaciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  empresa: text("empresa").notNull(),
  puesto: text("puesto").notNull(),
  url: text("url"),
  textoOferta: text("texto_oferta").notNull(), // el original, por si hay que volver a analizar
  oferta: text("oferta", { mode: "json" }).$type<Oferta>().notNull(), // lo que extrajo la IA
  estado: text("estado").$type<Estado>().notNull().default("sin_respuesta"),
  notas: text("notas").notNull().default(""),
  creadoEn: integer("creado_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  actualizadoEn: integer("actualizado_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
