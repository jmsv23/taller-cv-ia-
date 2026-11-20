// Rescate: salta al punto de control de un hito sin perder tu trabajo.
// Uso:  npm run rescate h2
// Funciona igual en Windows, Mac y Linux (Node puro).

import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HITOS = ["h1", "h2", "h3", "h4", "mvp"];
const hito = (process.argv[2] ?? "").toLowerCase();

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;

function salir(msg) {
  console.log(rojo(`\n❌ ${msg}\n`));
  process.exit(1);
}

// git es un .exe de verdad: sin shell, para que los mensajes con espacios no se rompan en Windows.
function git(...args) {
  const r = spawnSync("git", ["-c", "user.name=Alumno", "-c", "user.email=alumno@taller.local", ...args], {
    cwd: RAIZ,
    encoding: "utf8",
  });
  return { ok: r.status === 0, salida: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
}

// npm en Windows es un .cmd: necesita shell.
function npm(args) {
  return spawnSync(`npm ${args}`, { cwd: RAIZ, stdio: "inherit", shell: true }).status === 0;
}

if (!HITOS.includes(hito)) salir(`Dime a qué hito quieres saltar. Ejemplo:  npm run rescate h2   (opciones: ${HITOS.join(", ")})`);
if (!git("rev-parse", "--is-inside-work-tree").ok)
  salir("Esta carpeta no es un repositorio de git. Usa el ZIP del hito (está en HITOS.md).");

console.log(`\n🛟 Saltando al punto de control ${hito.toUpperCase()}...\n`);

// 1. Guardar lo que llevas en una rama aparte (nada se pierde).
const hora = new Date().toTimeString().slice(0, 5).replace(":", "");
const respaldo = `mi-intento-${hora}`;
git("add", "-A");
git("commit", "--allow-empty", "-m", `Mi intento antes de saltar a ${hito}`);
git("branch", "-f", respaldo);
console.log(`  ✅ Tu trabajo quedó guardado en la rama ${respaldo}`);

// 2. Traer el punto de control desde GitHub.
const fetch = git("fetch", "origin", hito);
if (!fetch.ok) salir(`No pude descargar ${hito} (¿hay internet?).\n${fetch.salida}`);
const cambio = git("checkout", "-f", "-B", `taller-${hito}`, "FETCH_HEAD");
if (!cambio.ok) salir(`No pude cambiar al punto de control.\n${cambio.salida}`);
console.log(`  ✅ Código de ${hito} descargado`);

// 3. Base de datos nueva (la tuya se guarda con otro nombre).
for (const archivo of ["local.db", "local.db-shm", "local.db-wal"]) {
  const ruta = path.join(RAIZ, archivo);
  if (!existsSync(ruta)) continue;
  try {
    renameSync(ruta, path.join(RAIZ, archivo.replace("local", `local-${respaldo}`)));
  } catch {
    salir("No pude mover local.db. Detén  npm run dev  (Ctrl + C) y vuelve a correr el rescate.");
  }
}

// 4. Dependencias y tablas.
if (!npm("install --prefer-offline --no-audit --no-fund")) salir("Falló npm install. Revisa tu internet y repite.");
if (!npm("run db:push")) salir("No pude crear las tablas. Toma captura y pide ayuda.");

console.log(verde(`\n✅ Listo: estás en ${hito.toUpperCase()}. Corre  npm run dev  y sigue con el siguiente hito.`));
console.log("   Tu key de OpenRouter (.env.local) sigue en su lugar.\n");
