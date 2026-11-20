import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { aplicaciones } from "@/db/schema";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Semaforo } from "@/components/Semaforo";
import { ESTADOS, LISTA_ESTADOS, MODALIDADES } from "@/lib/ofertas";
import { borrarAplicacion, cambiarEstado, guardarNotas } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaginaAplicacion({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const id = Number((await params).id);
  const { error } = await searchParams;
  const [app] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, id));
  if (!app) notFound();
  const o = app.oferta;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{app.puesto}</h1>
        <p className="text-lg text-neutral-700">{app.empresa}</p>
        <p className="text-sm text-neutral-500">
          {[o.ubicacion, MODALIDADES[o.modalidad], o.sueldo || "Sueldo no especificado"].filter(Boolean).join(" · ")}
        </p>
        {app.url && (
          <a href={app.url} target="_blank" className="text-sm underline">
            Ver oferta original
          </a>
        )}
      </header>

      {error && <Aviso>{error}</Aviso>}

      {/* Semáforo */}
      <section className="space-y-3 rounded border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Estado de la aplicación</h2>
        <Semaforo estado={app.estado} />
        <form action={cambiarEstado.bind(null, app.id)} className="flex flex-wrap gap-2">
          {LISTA_ESTADOS.map((e) => (
            <button
              key={e}
              name="estado"
              value={e}
              className={`flex items-center gap-2 rounded border px-3 py-1 text-sm ${
                e === app.estado ? "border-black font-semibold" : "border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <span className={`inline-block h-3 w-3 rounded-full ${ESTADOS[e].color}`} />
              {ESTADOS[e].etiqueta}
            </button>
          ))}
        </form>
      </section>

      {/* Lo que extrajo la IA */}
      <section className="space-y-4 rounded border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">La oferta</h2>
        <p>{o.resumen}</p>
        <Lista titulo="Requisitos" elementos={o.requisitos} />
        <Lista titulo="Deseables" elementos={o.deseables} />
        <Lista titulo="Responsabilidades" elementos={o.responsabilidades} />
        {o.palabrasClave.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {o.palabrasClave.map((p) => (
              <span key={p} className="rounded bg-neutral-100 px-2 py-1 text-xs">
                {p}
              </span>
            ))}
          </div>
        )}
        <details className="text-sm">
          <summary className="cursor-pointer text-neutral-500">Ver el texto original</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded bg-neutral-50 p-3 font-sans">{app.textoOferta}</pre>
        </details>
      </section>

      <section className="rounded border border-dashed border-neutral-300 p-5 text-neutral-500">
        <h2 className="text-xl font-semibold">Siguiente: H3 · Comparación con tu perfil</h2>
        <p>¿Qué cumples, qué te falta y qué deberías estudiar para este puesto?</p>
      </section>

      {/* Notas */}
      <section className="space-y-3 rounded border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Notas</h2>
        <form action={guardarNotas.bind(null, app.id)} className="space-y-2">
          <textarea
            name="notas"
            defaultValue={app.notas}
            rows={3}
            placeholder="¿A quién le escribiste? ¿Cuándo es la entrevista?"
            className="w-full rounded border border-neutral-300 p-2 text-sm"
          />
          <BotonEnviar variante="secundario" pendiente="Guardando…">
            Guardar notas
          </BotonEnviar>
        </form>
      </section>

      <form action={borrarAplicacion.bind(null, app.id)}>
        <BotonEnviar variante="peligro" pendiente="Borrando…">
          Borrar esta aplicación
        </BotonEnviar>
      </form>
    </main>
  );
}

function Lista({ titulo, elementos }: { titulo: string; elementos: string[] }) {
  if (elementos.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{titulo}</h3>
      <ul className="list-disc pl-5 text-sm">
        {elementos.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
