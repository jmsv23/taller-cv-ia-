"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { perfiles } from "@/db/schema";
import { perfilActual } from "@/db/consultas";
import { mensajeDeError } from "@/lib/errores";
import { textoDePdf } from "@/lib/pdf";
import { detectarInvenciones, extraerPerfil, mejorarPerfil, revisarPerfil, type Perfil } from "@/lib/perfil";

// Patrón de todas las acciones: intentamos; si falla, regresamos a la página con el error en la URL.
// (redirect() debe ir FUERA del try, porque internamente funciona lanzando un error.)
function volver(error?: string): never {
  revalidatePath("/perfil");
  redirect(error ? `/perfil?error=${encodeURIComponent(error)}` : "/perfil");
}

export async function cargarCv(formData: FormData) {
  let error = "";
  try {
    const archivo = formData.get("archivo");
    let texto = String(formData.get("texto") ?? "").trim();

    if (archivo instanceof File && archivo.size > 0) {
      if (archivo.name.toLowerCase().endsWith(".pdf")) texto = await textoDePdf(archivo);
      else texto = (await archivo.text()).trim();
    }

    if (texto.length < 50) {
      error = "No encontré suficiente texto. Si tu PDF es una imagen escaneada, mejor pega el texto de tu CV.";
    } else {
      const datos = await extraerPerfil(texto);
      await db.insert(perfiles).values({ datos, origen: "cv", textoCv: texto });
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  volver(error);
}

export async function revisar() {
  let error = "";
  try {
    const actual = await perfilActual();
    if (!actual) error = "Primero carga tu CV.";
    else {
      const revision = await revisarPerfil(actual.datos);
      await db.update(perfiles).set({ revision }).where(eq(perfiles.id, actual.id));
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  volver(error);
}

export async function aplicarMejoras() {
  let error = "";
  try {
    const actual = await perfilActual();
    if (!actual?.revision) error = "Primero pide la revisión del perfil.";
    else {
      const datos = await mejorarPerfil(actual.datos, actual.revision);
      const alertas = detectarInvenciones(datos, actual.datos);
      await db.insert(perfiles).values({ datos, origen: "mejora_ia", textoCv: actual.textoCv, alertas });
    }
  } catch (e) {
    error = mensajeDeError(e);
  }
  volver(error);
}

export async function editar(formData: FormData) {
  const actual = await perfilActual();
  if (!actual) volver("Primero carga tu CV.");
  const campo = (k: string) => String(formData.get(k) ?? "").trim();
  const datos: Perfil = {
    ...actual.datos,
    nombre: campo("nombre"),
    titular: campo("titular"),
    email: campo("email"),
    telefono: campo("telefono"),
    ubicacion: campo("ubicacion"),
    resumen: campo("resumen"),
    habilidades: campo("habilidades")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
  };
  await db.insert(perfiles).values({ datos, origen: "edicion", textoCv: actual.textoCv });
  volver();
}

export async function deshacer() {
  const [{ total }] = await db.select({ total: count() }).from(perfiles);
  const actual = await perfilActual();
  if (actual && total > 1) await db.delete(perfiles).where(eq(perfiles.id, actual.id));
  volver();
}

export async function empezarDeNuevo() {
  await db.delete(perfiles);
  volver();
}
