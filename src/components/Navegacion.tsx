import Link from "next/link";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/perfil", texto: "Mi perfil" },
  { href: "/prueba", texto: "Prueba de IA" },
];

export function Navegacion() {
  return (
    <nav className="border-b border-neutral-200 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-4 px-8 py-3 text-sm">
        <span className="font-semibold">🚦 Rastreador de CVs</span>
        {enlaces.map((e) => (
          <Link key={e.href} href={e.href} className="text-neutral-600 hover:text-black hover:underline">
            {e.texto}
          </Link>
        ))}
      </div>
    </nav>
  );
}
