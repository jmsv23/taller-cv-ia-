import { desc } from "drizzle-orm";
import { db } from "@/db";
import { pruebas } from "@/db/schema";
import { preguntarALaIA } from "./actions";

export const dynamic = "force-dynamic";

const hitos = [
  "H1 · Perfil: sube tu CV y conviértelo en un perfil estructurado",
  "H2 · Ofertas: pega una oferta de trabajo y regístrala como aplicación",
  "H3 · Comparación: ¿qué cumples, qué te falta y qué deberías estudiar?",
  "H4 · CV a la medida: genera un CV pensado para cada oferta",
];

export default async function Inicio() {
  const historial = await db
    .select()
    .from(pruebas)
    .orderBy(desc(pruebas.id))
    .limit(5);

  return (
    <main className="mx-auto w-full max-w-2xl p-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Taller: tu buscador de empleo con IA</h1>
        <p className="text-neutral-600">
          Si ves esta página, tu proyecto ya funciona. Lo que sigue lo construyes tú con opencode.
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Lo que vamos a construir</h2>
        <ol className="list-decimal space-y-1 pl-5">
          {hitos.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
