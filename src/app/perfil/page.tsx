import { perfilActual } from "@/db/consultas";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { VistaPerfil } from "@/components/VistaPerfil";
import { aplicarMejoras, cargarCv, deshacer, editar, empezarDeNuevo, revisar } from "./actions";

export const dynamic = "force-dynamic";

const ORIGEN = { cv: "extraído de tu CV", mejora_ia: "mejorado por la IA", edicion: "editado por ti" };

export default async function PaginaPerfil({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const actual = await perfilActual();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="text-neutral-600">
          Tu perfil es la fuente de verdad: todo lo que la IA haga después (comparar, generar CVs) sale de aquí.
        </p>
      </header>

      {error && <Aviso>{error}</Aviso>}

      {!actual ? (
        <FormularioCv />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span>
              Versión #{actual.id}, {ORIGEN[actual.origen]}
            </span>
            <form action={deshacer}>
              <BotonEnviar variante="secundario" pendiente="…">
                ↩ Deshacer
              </BotonEnviar>
            </form>
            <form action={empezarDeNuevo}>
              <BotonEnviar variante="peligro" pendiente="…">
                Borrar y cargar otro CV
              </BotonEnviar>
            </form>
          </div>

          {actual.alertas && actual.alertas.length > 0 && (
            <Aviso tipo="advertencia">
              <p className="font-semibold">⚠️ Revisa esto: la IA pudo haber inventado datos</p>
              <ul className="list-disc pl-5">
                {actual.alertas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="mt-1">Si no es cierto, usa “Deshacer” o corrígelo abajo.</p>
            </Aviso>
          )}

          <VistaPerfil perfil={actual.datos} />

          <section className="space-y-3 rounded border border-neutral-200 p-5">
            <h2 className="text-xl font-semibold">Mejorar mi perfil con IA</h2>
            {!actual.revision ? (
              <form action={revisar}>
                <BotonEnviar pendiente="Revisando tu perfil…">Revisar mi perfil</BotonEnviar>
              </form>
            ) : (
              <>
                <p>
                  Calificación: <strong>{actual.revision.calificacion}/10</strong>
                </p>
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {actual.revision.sugerencias.map((s, i) => (
                    <li key={i}>
                      <span className="rounded bg-neutral-100 px-1 text-xs uppercase">{s.seccion}</span>{" "}
                      <span className="text-neutral-600">{s.problema}</span>
                      <br />→ {s.sugerencia}
                    </li>
                  ))}
                </ol>
                <div className="flex gap-2">
                  <form action={aplicarMejoras}>
                    <BotonEnviar pendiente="Reescribiendo tu perfil…">Aplicar sugerencias</BotonEnviar>
                  </form>
                  <form action={revisar}>
                    <BotonEnviar variante="secundario" pendiente="Revisando…">
                      Revisar otra vez
                    </BotonEnviar>
                  </form>
                </div>
              </>
            )}
          </section>

          <details className="rounded border border-neutral-200 p-5">
            <summary className="cursor-pointer text-xl font-semibold">Editar a mano</summary>
            <form action={editar} className="mt-4 grid gap-3">
              <Campo nombre="nombre" etiqueta="Nombre" valor={actual.datos.nombre} />
              <Campo nombre="titular" etiqueta="Titular" valor={actual.datos.titular} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo nombre="email" etiqueta="Correo" valor={actual.datos.email} />
                <Campo nombre="telefono" etiqueta="Teléfono" valor={actual.datos.telefono} />
                <Campo nombre="ubicacion" etiqueta="Ubicación" valor={actual.datos.ubicacion} />
              </div>
              <label className="grid gap-1 text-sm">
                Resumen
                <textarea
                  name="resumen"
                  defaultValue={actual.datos.resumen}
                  rows={4}
                  className="rounded border border-neutral-300 p-2"
                />
              </label>
              <Campo
                nombre="habilidades"
                etiqueta="Habilidades (separadas por comas)"
                valor={actual.datos.habilidades.join(", ")}
              />
              <div>
                <BotonEnviar pendiente="Guardando…">Guardar cambios</BotonEnviar>
              </div>
            </form>
          </details>
        </>
      )}
    </main>
  );
}

function FormularioCv() {
  return (
    <form action={cargarCv} className="space-y-4 rounded border border-neutral-200 p-5">
      <h2 className="text-xl font-semibold">Llena tu perfil a partir de tu CV</h2>
      <label className="grid gap-1 text-sm">
        Sube tu CV en PDF (o .txt)
        <input name="archivo" type="file" accept=".pdf,.txt" className="text-sm" />
      </label>
      <p className="text-sm text-neutral-500">— o —</p>
      <label className="grid gap-1 text-sm">
        Pega el texto de tu CV (o escribe lo que has hecho: escuela, proyectos, trabajos, voluntariados)
        <textarea name="texto" rows={8} className="rounded border border-neutral-300 p-2" />
      </label>
      <p className="text-xs text-neutral-500">¿No tienes CV? Usa uno de ejemplo de la carpeta ejemplos/.</p>
      <BotonEnviar pendiente="Leyendo tu CV… (puede tardar hasta un minuto)">Llenar mi perfil con IA</BotonEnviar>
    </form>
  );
}

function Campo({ nombre, etiqueta, valor }: { nombre: string; etiqueta: string; valor: string }) {
  return (
    <label className="grid gap-1 text-sm">
      {etiqueta}
      <input name={nombre} defaultValue={valor} className="rounded border border-neutral-300 px-2 py-1" />
    </label>
  );
}
