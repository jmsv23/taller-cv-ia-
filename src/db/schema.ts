import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

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
