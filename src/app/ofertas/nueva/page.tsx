import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { registrarOferta } from "@/app/aplicaciones/actions";

export default async function NuevaOferta({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Nueva oferta</h1>
        <p className="text-neutral-600">
          Pega la oferta completa. La IA saca puesto, empresa, sueldo y requisitos, y la registra como aplicación.
        </p>
      </header>

      {error && <Aviso>{error}</Aviso>}

      <form action={registrarOferta} className="space-y-4 rounded border border-neutral-200 p-5">
        <label className="grid gap-1 text-sm">
          Texto de la oferta
          <textarea name="texto" rows={14} className="rounded border border-neutral-300 p-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Link de la oferta (si no pegas el texto, intento leerlo del link)
          <input name="url" type="url" placeholder="https://…" className="rounded border border-neutral-300 px-2 py-1" />
        </label>
        <p className="text-xs text-neutral-500">¿No tienes una a la mano? Usa las de la carpeta ejemplos/ofertas.</p>
        <BotonEnviar pendiente="Analizando la oferta…">Analizar y registrar</BotonEnviar>
      </form>
    </main>
  );
}
