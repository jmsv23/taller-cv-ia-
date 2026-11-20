import { desc } from "drizzle-orm";
import { db } from "@/db";
import { pruebas } from "@/db/schema";
import { preguntarALaIA } from "../actions";

export const dynamic = "force-dynamic";

export default async function Prueba() {
  const historial = await db
    .select()
    .from(pruebas)
    .orderBy(desc(pruebas.id))
    .limit(5);

  return (
    <main className="mx-auto w-full max-w-2xl p-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Prueba de conexión con la IA</h1>
        <p className="text-neutral-600">
          Esta es la página de ejemplo de la plantilla: una pregunta, una respuesta estructurada y un registro en la base de datos.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prueba la conexión con la IA</h2>
        <form action={preguntarALaIA} className="flex gap-2">
          <input
            name="pregunta"
            placeholder="Ej. ¿Qué es un ATS?"
            className="flex-1 rounded border border-neutral-300 px-3 py-2"
            required
          />
          <button className="rounded bg-black px-4 py-2 text-white">Preguntar</button>
        </form>
        <ul className="space-y-3">
          {historial.map((p) => (
            <li key={p.id} className="rounded border border-neutral-200 p-3">
              <p className="font-medium">{p.pregunta}</p>
              <p className="text-neutral-700">{p.respuesta}</p>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
