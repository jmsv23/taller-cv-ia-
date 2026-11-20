import { defineConfig } from "drizzle-kit";

// Después de cambiar src/db/schema.ts corre:  npm run db:push
export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:local.db",
  },
});
