// Verificación de la tarea previa del taller.
// Corre con:  npm run check
// Funciona igual en Windows, Mac y Linux (Node puro, sin bash ni PowerShell).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV = path.join(RAIZ, ".env.local");
const SO = { win32: "Windows", darwin: "Mac", linux: "Linux" }[process.platform] ?? process.platform;

// Modelos gratis de OpenRouter con salida estructurada, en orden de preferencia.
// Si el primero no responde, el script prueba el siguiente y guarda el que funcione.
const MODELOS_GRATIS = [
  "nvidia/nemotron-3.5-super-vl:free",
  "baidu/ernie-5.5-flash-preview:free",
  "inclusionai/ling-3.2-flash:free",
  "google/gemma-4-31b-it:free",
];

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const amarillo = (t) => `\x1b[33m${t}\x1b[0m`;
const negrita = (t) => `\x1b[1m${t}\x1b[0m`;

const problemas = [];
const avisos = [];

function ok(msg) {
  console.log(`  ${verde("✅")} ${msg}`);
}
function falla(msg, solucion) {
  console.log(`  ${rojo("❌")} ${msg}`);
  if (solucion) console.log(`     ${amarillo("→")} ${solucion}`);
  problemas.push(msg);
}
function aviso(msg, solucion) {
  console.log(`  ${amarillo("⚠️ ")} ${msg}`);
  if (solucion) console.log(`     ${amarillo("→")} ${solucion}`);
  avisos.push(msg);
}
function paso(n, titulo) {
  console.log(`\n${negrita(`${n}. ${titulo}`)}`);
}

// En Windows los comandos instalados con npm son .cmd, por eso usamos shell: true.
function correr(cmd, args = []) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: true, cwd: RAIZ });
  return { ok: r.status === 0, salida: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
}

function leerEnv() {
  if (!existsSync(ENV)) return {};
  const vars = {};
  for (const linea of readFileSync(ENV, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return vars;
}

function guardarEnv(vars) {
  const contenido = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  writeFileSync(ENV, contenido + "\n", "utf8");
}

async function preguntar(texto) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const r = await rl.question(texto);
  rl.close();
  return r.trim();
}

console.log(negrita(`\n🔎 Revisando tu computadora (${SO})...`));

// 1. Node
paso(1, "Node.js");
const [mayor] = process.versions.node.split(".").map(Number);
if (mayor < 22) {
  falla(
    `Tienes Node ${process.versions.node} y se necesita la versión LTS (26 o 24; mínimo la 22).`,
    "Instala Node LTS siguiendo la guía (paso 1) y vuelve a abrir la terminal.",
  );
} else if (mayor < 24) {
  ok(`Node ${process.versions.node}`);
  aviso("Funciona, pero recomendamos la versión LTS actual (26) para que todos tengamos lo mismo.");
} else {
  ok(`Node ${process.versions.node}`);
}

// 2. Dependencias
paso(2, "Dependencias del proyecto");
if (!existsSync(path.join(RAIZ, "node_modules", "next"))) {
  falla("No están instaladas las dependencias.", "Corre:  npm install   y después otra vez  npm run check");
  console.log(rojo("\nNo puedo seguir sin las dependencias.\n"));
  process.exit(1);
}
ok("Dependencias instaladas");

// 3. Git
paso(3, "Git");
const git = correr("git", ["--version"]);
if (git.ok) ok(git.salida);
else falla("No encuentro git.", `Instálalo siguiendo la guía para ${SO} (paso 2).`);

// 4. opencode
paso(4, "opencode");
const oc = correr("opencode", ["--version"]);
if (!oc.ok) {
  const extra =
    process.platform === "win32" && /scripts|ejecución|execution/i.test(oc.salida)
      ? "PowerShell bloquea scripts. Corre una vez:  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"
      : "Corre:  npm i -g opencode-ai   cierra la terminal, ábrela de nuevo y vuelve a intentar.";
  falla("No encuentro opencode.", extra);
} else {
  ok(`opencode ${oc.salida.split(/\s+/).pop()}`);
  const auth = correr("opencode", ["auth", "list"]);
  const proveedores = auth.salida
    .split(/\r?\n/)
    .filter((l) => /\b(stored|environment)\s*$/.test(l))
    .map((l) => l.split(/\s{2,}/)[0])
    .filter((v, i, a) => a.indexOf(v) === i);
  if (proveedores.length > 0) ok(`opencode tiene proveedores conectados: ${proveedores.join(", ")}`);
  else
    falla(
      "opencode no tiene ningún proveedor de modelos conectado.",
      "Corre:  opencode auth login   y conecta OpenCode Zen (paso 6 de la guía).",
    );
}

// 5. Base de datos
paso(5, "Base de datos");
try {
  const { createClient } = await import("@libsql/client");
  const db = createClient({ url: "file:" + path.join(RAIZ, "local.db") });
  await db.execute("select 1");
  db.close();
  const push = correr("npm", ["run", "db:push"]);
  if (push.ok) ok("Base de datos creada (archivo local.db)");
  else falla("No pude crear las tablas.", "Toma captura de este mensaje y mándala:\n" + push.salida.slice(-600));
} catch (e) {
  falla("No pude abrir la base de datos.", `Toma captura y mándala: ${e.message}`);
}

// 6. OpenRouter
paso(6, "Conexión con la IA (OpenRouter)");
const env = leerEnv();
let key = env.OPENROUTER_API_KEY;
if (!key) {
  console.log("  Necesito tu key de OpenRouter (empieza con sk-or-).");
  console.log("  La sacas en: https://openrouter.ai/settings/keys");
  key = await preguntar("  Pégala aquí y presiona Enter: ");
}
if (!key.startsWith("sk-or-")) {
  falla(
    "Esa no parece una key de OpenRouter (debe empezar con sk-or-).",
    "Vuelve a correr  npm run check  y pega la key completa.",
  );
} else {
  const info = await fetch("https://openrouter.ai/api/v1/key", {
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);

  if (!info) {
    falla("No pude conectarme a internet / OpenRouter.", "Revisa tu conexión y vuelve a intentar.");
  } else if (info.status === 401) {
    delete env.OPENROUTER_API_KEY;
    guardarEnv(env);
    falla("OpenRouter dice que la key no es válida.", "Crea otra en https://openrouter.ai/settings/keys y vuelve a correr npm run check.");
  } else {
    env.OPENROUTER_API_KEY = key;
    guardarEnv(env);
    ok("Key válida y guardada en .env.local");
    const datos = (await info.json().catch(() => ({}))).data ?? {};
    if (datos.is_free_tier) {
      aviso(
        "Tu cuenta es gratis: tienes un límite de peticiones al día.",
        "Es suficiente para la app. Si puedes, OpenCode Go (10 USD) mejora mucho la experiencia con opencode.",
      );
    }

    const candidatos = [env.AI_MODEL, ...MODELOS_GRATIS].filter((v, i, a) => v && a.indexOf(v) === i);
    let funciono = null;
    let ultimoError = "";
    for (const m of candidatos) {
      process.stdout.write(`  … probando ${m} `);
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m,
          messages: [{ role: "user", content: 'Responde con el JSON {"listo": true}' }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "prueba",
              strict: true,
              schema: {
                type: "object",
                properties: { listo: { type: "boolean" } },
                required: ["listo"],
                additionalProperties: false,
              },
            },
          },
        }),
      }).catch((e) => ({ ok: false, status: 0, text: async () => e.message }));
      if (r.ok) {
        console.log(verde("✓"));
        funciono = m;
        break;
      }
      ultimoError = `${r.status} ${(await r.text()).slice(0, 200)}`;
      console.log(rojo(`✗ (${r.status})`));
    }

    if (funciono) {
      env.AI_MODEL = funciono;
      guardarEnv(env);
      ok(`La IA responde con salida estructurada usando ${funciono}`);
    } else if (ultimoError.startsWith("429")) {
      falla("OpenRouter dice que llegaste al límite de peticiones.", "Espera un rato y vuelve a intentar. No es tu culpa ni tu computadora.");
    } else {
      falla("Ningún modelo gratis respondió.", `Toma captura y mándala: ${ultimoError}`);
    }
  }
}

// Resumen
console.log("\n" + "─".repeat(50));
if (problemas.length === 0) {
  console.log(verde(negrita("✅ ¡Todo listo! Nos vemos en el taller.")));
  console.log("   Opcional: corre  npm run dev  y abre http://localhost:3000");
  if (avisos.length) console.log(amarillo(`   (${avisos.length} aviso(s) arriba: no son graves)`));
} else {
  console.log(rojo(negrita(`❌ Hay ${problemas.length} problema(s):`)));
  for (const p of problemas) console.log(rojo(`   • ${p}`));
  console.log("\n   Revisa la sección \"Errores comunes\" del README.");
  console.log("   Si no se arregla, toma captura de TODA esta pantalla y mándala al grupo.");
}
console.log("─".repeat(50) + "\n");
process.exit(problemas.length === 0 ? 0 : 1);
