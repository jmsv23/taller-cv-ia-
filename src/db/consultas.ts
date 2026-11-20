import { desc } from "drizzle-orm";
import { db } from "@/db";
import { perfiles } from "@/db/schema";

// El perfil actual es la versión más reciente.
export async function perfilActual() {
  const [ultimo] = await db.select().from(perfiles).orderBy(desc(perfiles.id)).limit(1);
  return ultimo ?? null;
}
