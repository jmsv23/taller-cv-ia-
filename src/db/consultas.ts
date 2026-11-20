import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comparaciones, perfiles } from "@/db/schema";

// El perfil actual es la versión más reciente.
export async function perfilActual() {
  const [ultimo] = await db.select().from(perfiles).orderBy(desc(perfiles.id)).limit(1);
  return ultimo ?? null;
}

export async function ultimaComparacion(aplicacionId: number) {
  const [ultima] = await db
    .select()
    .from(comparaciones)
    .where(eq(comparaciones.aplicacionId, aplicacionId))
    .orderBy(desc(comparaciones.id))
    .limit(1);
  return ultima ?? null;
}
