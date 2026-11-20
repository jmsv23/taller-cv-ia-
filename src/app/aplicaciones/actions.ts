"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { aplicaciones, comparaciones, cvs } from "@/db/schema";
import { perfilActual, ultimaComparacion } from "@/db/consultas";
import { generarCv } from "@/lib/cv";
import { compararPerfilConOferta } from "@/lib/comparacion";
import { mensajeDeError } from "@/lib/errores";
import { analizarOferta, LISTA_ESTADOS, type Estado } from "@/lib/ofertas";

export async function registrarOferta(formData: FormData) {
  const texto = String(formData.get("texto") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;

  let error = "";
  let id = 0;
  try {
    if (texto.length < 80) error = "Pega el texto completo de la oferta (descripción, requisitos, sueldo…).";
    else {
      const oferta = await analizarOferta(texto);
      const [nueva] = await db
        .insert(aplicaciones)
        .values({ empresa: oferta.empresa, puesto: oferta.puesto, url, textoOferta: texto, oferta })
        .returning({ id: aplicaciones.id });
      id = nueva.id;
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  if (error) redirect(`/ofertas/nueva?error=${encodeURIComponent(error)}`);
  revalidatePath("/");
  redirect(`/aplicaciones/${id}`);
}

export async function cambiarEstado(id: number, formData: FormData) {
  const estado = String(formData.get("estado")) as Estado;
  if (!LISTA_ESTADOS.includes(estado)) return;
  await db.update(aplicaciones).set({ estado, actualizadoEn: new Date() }).where(eq(aplicaciones.id, id));
  revalidatePath("/");
  revalidatePath(`/aplicaciones/${id}`);
}

export async function guardarNotas(id: number, formData: FormData) {
  const notas = String(formData.get("notas") ?? "");
  await db.update(aplicaciones).set({ notas, actualizadoEn: new Date() }).where(eq(aplicaciones.id, id));
  revalidatePath(`/aplicaciones/${id}`);
}

export async function borrarAplicacion(id: number) {
  await db.delete(aplicaciones).where(eq(aplicaciones.id, id));
  revalidatePath("/");
  redirect("/");
}

export async function comparar(id: number) {
  let error = "";
  try {
    const perfil = await perfilActual();
    const [app] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, id));
    if (!perfil) error = "Primero carga tu perfil.";
    else if (!app) error = "No encontré esa aplicación.";
    else {
      const resultado = await compararPerfilConOferta(perfil.datos, app.oferta);
      await db.insert(comparaciones).values({
        aplicacionId: id,
        perfilId: perfil.id,
        porcentaje: resultado.porcentaje,
        resultado,
      });
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  revalidatePath(`/aplicaciones/${id}`);
  revalidatePath("/");
  if (error) redirect(`/aplicaciones/${id}?error=${encodeURIComponent(error)}`);
}

export async function crearCv(id: number) {
  let error = "";
  let cvId = 0;
  try {
    const perfil = await perfilActual();
    const [app] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, id));
    if (!perfil) error = "Primero carga tu perfil.";
    else if (!app) error = "No encontré esa aplicación.";
    else {
      const comparacion = await ultimaComparacion(id);
      const resultado = await generarCv(perfil.datos, app.oferta, comparacion?.resultado ?? null);
      const [nuevo] = await db.insert(cvs).values({ aplicacionId: id, resultado }).returning({ id: cvs.id });
      cvId = nuevo.id;
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  revalidatePath(`/aplicaciones/${id}`);
  if (error) redirect(`/aplicaciones/${id}?error=${encodeURIComponent(error)}`);
  redirect(`/cv/${cvId}`);
}

// Marca cuál CV fue el que realmente mandaste (solo puede haber uno por aplicación).
export async function marcarEnviado(aplicacionId: number, cvId: number) {
  await db.update(cvs).set({ enviado: false }).where(eq(cvs.aplicacionId, aplicacionId));
  await db.update(cvs).set({ enviado: true }).where(eq(cvs.id, cvId));
  revalidatePath(`/aplicaciones/${aplicacionId}`);
  revalidatePath(`/cv/${cvId}`);
}
