import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { aplicaciones, cvs } from "@/db/schema";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { BotonImprimir } from "@/components/BotonImprimir";
import { marcarEnviado } from "@/app/aplicaciones/actions";

export const dynamic = "force-dynamic";

async function cargar(idTexto: string) {
  const [fila] = await db
    .select()
    .from(cvs)
    .innerJoin(aplicaciones, eq(cvs.aplicacionId, aplicaciones.id))
    .where(eq(cvs.id, Number(idTexto)));
  return fila ?? null;
}

// El título de la página es el nombre que el navegador propone al guardar el PDF.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const fila = await cargar((await params).id);
  return { title: fila ? `CV ${fila.cvs.resultado.cv.nombre} - ${fila.aplicaciones.puesto}` : "CV" };
}

export default async function PaginaCv({ params }: { params: Promise<{ id: string }> }) {
  const fila = await cargar((await params).id);
  if (!fila) notFound();
  const { cv, alertas, cobertura } = fila.cvs.resultado;
  const app = fila.aplicaciones;
  const contacto = [cv.email, cv.telefono, cv.ubicacion].filter(Boolean).join(" | ");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-8 print:p-0">
      {/* Panel de control: no sale en el PDF */}
      <div className="space-y-4 print:hidden">
        <Link href={`/aplicaciones/${app.id}`} className="text-sm underline">
          ← {app.puesto} en {app.empresa}
        </Link>

        {alertas.length > 0 ? (
          <Aviso tipo="advertencia">
            <p className="font-semibold">⚠️ Antes de mandarlo: esto no estaba en tu perfil</p>
            <ul className="list-disc pl-5">
              {alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p>Si no es verdad, no lo mandes así: genera otro o corrige tu perfil.</p>
          </Aviso>
        ) : (
          <Aviso tipo="exito">✅ No detecté datos que no estén en tu perfil.</Aviso>
        )}

        <Aviso tipo="advertencia">
          <p>
            <strong>Palabras clave de la oferta en tu CV:</strong> {cobertura.incluidas.length} de{" "}
            {cobertura.incluidas.length + cobertura.faltantes.length}
          </p>
          {cobertura.faltantes.length > 0 && (
            <p>
              Faltan: {cobertura.faltantes.join(", ")}. Si de verdad las tienes, agrégalas a tu perfil; si no, son algo
              para estudiar.
            </p>
          )}
        </Aviso>

        <div className="flex flex-wrap gap-2">
          <BotonImprimir />
          {fila.cvs.enviado ? (
            <span className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
              📨 Este es el CV que enviaste
            </span>
          ) : (
            <form action={marcarEnviado.bind(null, app.id, fila.cvs.id)}>
              <BotonEnviar variante="secundario" pendiente="…">
                📨 Marcar como el que envié
              </BotonEnviar>
            </form>
          )}
        </div>
        <hr />
      </div>

      {/* El CV: una columna, encabezados estándar, solo texto. Así lo lee bien un ATS. */}
      <article className="cv space-y-4 font-serif text-[11pt] leading-snug text-black">
        <header>
          <h1 className="text-2xl font-bold">{cv.nombre}</h1>
          <p>{cv.titular}</p>
          <p>{contacto}</p>
        </header>

        {cv.resumen && (
          <section>
            <h2>Resumen</h2>
            <p>{cv.resumen}</p>
          </section>
        )}

        {cv.experiencia.length > 0 && (
          <section>
            <h2>Experiencia</h2>
            {cv.experiencia.map((e, i) => (
              <div key={i} className="mb-2">
                <p>
                  <strong>{e.puesto}</strong>, {e.organizacion} — {e.periodo}
                </p>
                <ul className="list-disc pl-5">
                  {e.logros.map((l, j) => (
                    <li key={j}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {cv.proyectos.length > 0 && (
          <section>
            <h2>Proyectos</h2>
            {cv.proyectos.map((p, i) => (
              <p key={i} className="mb-1">
                <strong>{p.nombre}</strong>: {p.descripcion}
                {p.tecnologias.length > 0 && ` (${p.tecnologias.join(", ")})`}
              </p>
            ))}
          </section>
        )}

        {cv.educacion.length > 0 && (
          <section>
            <h2>Educación</h2>
            {cv.educacion.map((e, i) => (
              <p key={i}>
                <strong>{e.titulo}</strong>, {e.institucion} — {e.periodo}
              </p>
            ))}
          </section>
        )}

        {cv.habilidades.length > 0 && (
          <section>
            <h2>Habilidades</h2>
            <p>{cv.habilidades.join(", ")}</p>
          </section>
        )}

        {cv.idiomas.length > 0 && (
          <section>
            <h2>Idiomas</h2>
            <p>{cv.idiomas.map((i) => `${i.idioma}: ${i.nivel}`).join(", ")}</p>
          </section>
        )}
      </article>
    </main>
  );
}
