import Link from "next/link";
import { perfilActual } from "@/db/consultas";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const perfil = await perfilActual();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Conecta y automatiza: construye un flujo de trabajo con IA</h1>
        <p className="text-neutral-600">Tu rastreador de ofertas de trabajo y CVs a la medida.</p>
      </header>

      <section className="rounded border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">1. Tu perfil</h2>
        {perfil ? (
          <p>
            ✅ Listo: <strong>{perfil.datos.nombre}</strong>.{" "}
            <Link href="/perfil" className="underline">
              Verlo o mejorarlo
            </Link>
          </p>
        ) : (
          <p>
            Todavía no tienes perfil.{" "}
            <Link href="/perfil" className="underline">
              Cárgalo desde tu CV
            </Link>
          </p>
        )}
      </section>

      <section className="rounded border border-dashed border-neutral-300 p-5 text-neutral-500">
        <h2 className="text-xl font-semibold">Siguiente: H2 · Ofertas y aplicaciones</h2>
        <p>Pega una oferta de trabajo y regístrala como aplicación con su semáforo.</p>
      </section>
    </main>
  );
}
