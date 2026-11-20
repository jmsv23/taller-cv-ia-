import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// La base de datos es un solo archivo: local.db, en la raíz del proyecto.
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
});

export const db = drizzle(client, { schema });
