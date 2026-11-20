// Utilidades para comparar textos sin que importen mayúsculas ni acentos.
// Las usamos para revisar el trabajo de la IA con código (no con más IA).

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ¿La frase aparece dentro del texto? (ignorando mayúsculas y acentos)
export function apareceEn(texto: string, frase: string): boolean {
  const f = normalizar(frase);
  return f.length > 0 && normalizar(texto).includes(f);
}

// ¿La mayoría de las palabras importantes de la cita aparecen en el texto?
// Sirve para saber si una "evidencia" que dio la IA de verdad sale del perfil.
export function citaVerificable(texto: string, cita: string): boolean {
  const palabras = normalizar(cita)
    .split(" ")
    .filter((p) => p.length > 3);
  if (palabras.length === 0) return false;
  const base = normalizar(texto);
  const encontradas = palabras.filter((p) => base.includes(p)).length;
  return encontradas / palabras.length >= 0.6;
}
