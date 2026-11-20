import { extractText, getDocumentProxy } from "unpdf";

// Saca el texto de un PDF que el usuario subió en un formulario.
export async function textoDePdf(archivo: File): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(await archivo.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}
