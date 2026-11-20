import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { aplicaciones, comparaciones } from "@/db/schema";
import { perfilActual } from "@/db/consultas";
import { Semaforo } from "@/components/Semaforo";
import { ESTADOS, LISTA_ESTADOS } from "@/lib/ofertas";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const perfil = await perfilActual();
  const lista = await db.select().from(aplicaciones).orderBy(desc(aplicaciones.actualizadoEn));
  const conteo = (e: string) => lista.filter((a) => a.estado === e).length;

  // El porcentaje más reciente de cada aplicación.
  const porcentajes = new Map<number, number>();
  for (const c of await db.select().from(comparaciones).orderBy(comparaciones.id))
    porcentajes.set(c.aplicacionId, c.porcentaje);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Mis aplicaciones</h1>
        <p className="text-neutral-600">
          {perfil ? (
            <>
              Perfil de <strong>{perfil.datos.nombre}</strong> ·{" "}
              <Link href="/perfil" className="underline">
                ver perfil
              </Link>
            </>
          ) : (
            <>
              Todavía no tienes perfil.{" "}
              <Link href="/perfil" className="underline">
                Cárgalo desde tu CV
              </Link>{" "}
              para poder comparar ofertas.
            </>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-4 text-sm">
        {LISTA_ESTADOS.map((e) => (
          <span key={e} className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${ESTADOS[e].color}`} />
            {conteo(e)} {ESTADOS[e].etiqueta.toLowerCase()}
          </span>
        ))}
      </div>

      <Link href="/ofertas/nueva" className="inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white">
        + Registrar una oferta
      </Link>

      {lista.length === 0 ? (
        <p className="text-neutral-500">Aún no registras ninguna oferta.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded border border-neutral-200">
          {lista.map((a) => (
            <li key={a.id}>
              <Link href={`/aplicaciones/${a.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50">
                <div>
                  <p className="font-medium">{a.puesto}</p>
                  <p className="text-sm text-neutral-500">
                    {a.empresa} · registrada el {a.creadoEn.toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {porcentajes.has(a.id) && (
                    <span className="text-sm text-neutral-600">{porcentajes.get(a.id)}% compatible</span>
                  )}
                  <Semaforo estado={a.estado} conTexto={false} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
