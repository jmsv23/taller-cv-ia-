import { APICallError, NoObjectGeneratedError, NoOutputGeneratedError, RetryError } from "ai";

// Convierte cualquier error en un mensaje que un humano pueda entender.
export function mensajeDeError(e: unknown): string {
  if (RetryError.isInstance(e)) return mensajeDeError(e.lastError);

  if (APICallError.isInstance(e)) {
    if (e.statusCode === 429)
      return "Llegaste al límite de peticiones de los modelos gratis. Espera un minuto y vuelve a intentar.";
    if (e.statusCode === 401)
      return "Tu key de OpenRouter no es válida. Corre  npm run check  para configurarla otra vez.";
    if (e.statusCode === 404)
      return "Ese modelo ya no existe en OpenRouter. Corre  npm run check  para que elija otro.";
    return `OpenRouter respondió con error ${e.statusCode ?? ""}: ${e.message}`;
  }

  if (NoObjectGeneratedError.isInstance(e) || NoOutputGeneratedError.isInstance(e))
    return "La IA respondió, pero no con el formato que le pedimos. Vuelve a intentar (a veces a la segunda sale).";

  if (e instanceof Error) {
    if (/api key is missing/i.test(e.message))
      return "Falta tu key de OpenRouter en .env.local. Corre  npm run check  y después reinicia  npm run dev.";
    if (/fetch failed|ENOTFOUND|ECONNRESET/i.test(e.message))
      return "No hay conexión con internet o con OpenRouter. Revisa tu red.";
    return e.message;
  }
  return "Algo salió mal.";
}
