// Caja de colores para mostrar errores y advertencias.
export function Aviso({
  tipo = "error",
  children,
}: {
  tipo?: "error" | "advertencia" | "exito";
  children: React.ReactNode;
}) {
  const estilos = {
    error: "border-red-300 bg-red-50 text-red-800",
    advertencia: "border-yellow-300 bg-yellow-50 text-yellow-900",
    exito: "border-green-300 bg-green-50 text-green-800",
  }[tipo];
  return <div className={`rounded border p-3 text-sm ${estilos}`}>{children}</div>;
}
