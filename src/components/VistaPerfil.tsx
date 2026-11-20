import type { Perfil } from "@/lib/perfil";

// Muestra un perfil de forma legible (no es el CV final, solo para revisar los datos).
export function VistaPerfil({ perfil }: { perfil: Perfil }) {
  const contacto = [perfil.email, perfil.telefono, perfil.ubicacion].filter(Boolean).join(" · ");
  return (
    <div className="space-y-5 rounded border border-neutral-200 p-5">
      <div>
        <p className="text-2xl font-bold">{perfil.nombre || "(sin nombre)"}</p>
        <p className="text-neutral-700">{perfil.titular}</p>
        {contacto && <p className="text-sm text-neutral-500">{contacto}</p>}
      </div>

      <Seccion titulo="Resumen">
        <p>{perfil.resumen || <Vacio />}</p>
      </Seccion>

      <Seccion titulo="Habilidades">
        {perfil.habilidades.length ? (
          <div className="flex flex-wrap gap-2">
            {perfil.habilidades.map((h) => (
              <span key={h} className="rounded bg-neutral-100 px-2 py-1 text-sm">
                {h}
              </span>
            ))}
          </div>
        ) : (
          <Vacio />
        )}
      </Seccion>

      <Seccion titulo="Experiencia">
        {perfil.experiencia.length ? (
          perfil.experiencia.map((e, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium">
                {e.puesto} — {e.organizacion} <span className="text-sm text-neutral-500">({e.periodo})</span>
              </p>
              <ul className="list-disc pl-5 text-sm">
                {e.logros.map((l, j) => (
                  <li key={j}>{l}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <Vacio />
        )}
      </Seccion>

      <Seccion titulo="Proyectos">
        {perfil.proyectos.length ? (
          perfil.proyectos.map((p, i) => (
            <div key={i} className="mb-2 text-sm">
              <p className="font-medium">{p.nombre}</p>
              <p>{p.descripcion}</p>
              {p.tecnologias.length > 0 && <p className="text-neutral-500">{p.tecnologias.join(", ")}</p>}
            </div>
          ))
        ) : (
          <Vacio />
        )}
      </Seccion>

      <Seccion titulo="Educación">
        {perfil.educacion.length ? (
          perfil.educacion.map((e, i) => (
            <p key={i} className="text-sm">
              <span className="font-medium">{e.titulo}</span> — {e.institucion} ({e.periodo})
            </p>
          ))
        ) : (
          <Vacio />
        )}
      </Seccion>

      <Seccion titulo="Idiomas">
        {perfil.idiomas.length ? (
          <p className="text-sm">{perfil.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(" · ")}</p>
        ) : (
          <Vacio />
        )}
      </Seccion>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500">{titulo}</h3>
      {children}
    </section>
  );
}

function Vacio() {
  return <span className="text-sm italic text-neutral-400">(vacío)</span>;
}
