# Guía del taller «Conecta y automatiza: construye un flujo de trabajo con IA»

Hoy vas a construir, con opencode, una app que:

1. **H1 · Perfil.** Lee tu CV y lo convierte en un perfil ordenado, y luego te dice cómo mejorarlo.
2. **H2 · Ofertas.** Guarda las ofertas de trabajo que te interesan y lleva un semáforo de cada aplicación.
3. **H3 · Comparación.** Te dice qué cumples, qué te falta y qué te conviene estudiar para cada oferta.
4. **H4 · CV a la medida.** Te arma un CV pensado para cada oferta, sin inventar nada y que un ATS pueda leer.

No hay una sola respuesta correcta. Tu app no tiene que quedar igual a la del instructor. Lo que importa es **cómo decides**: qué datos guardar, qué le pides a la IA, cómo sabes si te está mintiendo.

---

## Antes de empezar (5 minutos)

### 1. Actualiza el proyecto

En la terminal, dentro de la carpeta `taller-cv-ia-`:

```
git pull
npm install
```

### 2. Abre dos terminales en la carpeta del proyecto

| Terminal 1: la app | Terminal 2: el agente |
|---|---|
| `npm run dev` | `opencode` |
| Déjala corriendo. Abre http://localhost:3000 | Aquí platicas con la IA que escribe el código |

> En VS Code: menú **Terminal → New Terminal** dos veces. Si cierras la terminal 1, la app se apaga.

### 3. Elige quién empieza a manejar

Trabajan **en pareja**:

- **Piloto**: tiene el teclado y escribe en opencode.
- **Copiloto**: lee esta guía, piensa las preguntas, revisa lo que hace la IA y prueba en el navegador.

**Cambien de rol en cada hito.** El copiloto no es un espectador: es quien detecta cuando la IA hizo algo raro.

### 4. Crea tu bitácora

Crea un archivo `mis-decisiones.md` en la carpeta del proyecto. En cada hito vas a anotar, en dos o tres líneas, qué decidieron y por qué. Al final esto vale más que el código.

---

## Cómo hablarle a opencode

- **Primero el plan, luego el código.** Presiona `Tab` para cambiar al modo **Plan** (solo piensa, no toca archivos). Cuando el plan te convenza, presiona `Tab` otra vez para volver a **Build** y dile "adelante".
- **Di el qué y el porqué**, no solo el qué: *"Quiero guardar el perfil para que después la IA pueda compararlo con ofertas"* funciona mejor que *"haz una tabla"*.
- **Un cambio a la vez.** Pide algo pequeño, pruébalo en el navegador y luego pide lo siguiente.
- **Si rompió algo:** escribe `/undo` y deshace su último cambio.
- **Si se confundió mucho:** escribe `/new` para empezar una conversación limpia. Tu código no se borra.
- **Si te contesta en inglés o cosas sin sentido:** cambia de modelo con `/models`.
- **Lee lo que hace.** Si no entiendes un cambio, pregúntale: *"explícame qué cambiaste y por qué, como si fuera mi primer semestre"*.

El proyecto ya trae un archivo `AGENTS.md` que le explica a opencode el stack, las reglas y que eres de primer semestre. No tienes que repetírselo.

---

## H1 · Perfil (20 min)

**Meta:** subes tu CV (PDF o texto) y la app lo convierte en un perfil con datos ordenados. Después la IA te dice cómo mejorarlo.

> ¿No tienes CV? Usa `ejemplos/cv-valeria.pdf` o `ejemplos/cv-diego.txt`. También puedes escribir en texto lo que has hecho: escuela, proyectos, trabajos de verano, voluntariados.

### Piensen antes de escribirle a la IA

- ¿Qué **campos** necesita un perfil para que después la IA pueda compararlo con una oferta? ¿Cuáles sobran?
- ¿Guardan cada cosa en su propia columna o todo el perfil junto? ¿Qué ganan y qué pierden con cada opción?
- Si la IA "mejora" tu perfil, ¿cómo sabes que no te inventó experiencia?

Anoten su respuesta en `mis-decisiones.md`.

### Está listo cuando

- [ ] Subes un CV (PDF o texto pegado) y aparece tu perfil con nombre, habilidades, experiencia y educación.
- [ ] El perfil se guarda: si recargas la página, sigue ahí.
- [ ] Hay un botón que le pide a la IA sugerencias para mejorarlo.

### Pistas

- El ejemplo de `src/app/actions.ts` ya hace casi todo lo que necesitas: llamar a la IA con un **esquema** y guardar el resultado.
- El **esquema de Zod** es el contrato con la IA: si un campo no está en el esquema, la IA no lo llena.
- Para leer PDFs ya está instalado `unpdf`.

<details>
<summary>🌱 Prompt semilla (úsalo solo si llevan más de 10 minutos atorados)</summary>

```
Quiero una página /perfil donde suba mi CV en PDF o pegue el texto.
En el servidor, saca el texto del PDF con unpdf y pídele a la IA (con generateText y
Output.object, como en src/app/actions.ts) que lo convierta en un perfil con:
nombre, titular, email, teléfono, ubicación, resumen, habilidades (lista),
experiencia (puesto, organización, periodo, logros), educación, proyectos e idiomas.
La IA no debe inventar nada: si algo no viene en el CV, que lo deje vacío.
Guarda el perfil en una tabla nueva de SQLite y muéstralo en la página.
Primero dime tu plan (qué tabla y qué archivos) antes de escribir código.
```

Para las mejoras:

```
Agrega un botón "Revisar mi perfil" que le pida a la IA entre 3 y 6 sugerencias
concretas (sección, problema, cómo mejorarlo) y las muestre en la página.
Las sugerencias nunca deben proponer inventar experiencia.
```

</details>

---

## H2 · Ofertas y aplicaciones (20 min)

**Meta:** pegas el texto de una oferta de trabajo, la IA saca los datos importantes y se guarda como una **aplicación** con su semáforo.

> Ofertas de ejemplo en `ejemplos/ofertas/`.

### Piensen antes de escribirle a la IA

- De todo el texto de una oferta, ¿qué datos **importan** y cuáles son **ruido**?
- ¿Cómo separas lo **obligatorio** de lo **deseable**? ¿Importa para lo que sigue?
- El semáforo tiene 4 estados: *sin respuesta*, *piden más información*, *entrevista programada*, *declinada*. ¿Qué colores les pondrían y por qué? ¿Les falta algún estado?
- ¿Guardan el texto original de la oferta además de lo que extrajo la IA? ¿Para qué serviría?

### Está listo cuando

- [ ] Pegas una oferta y aparece con empresa, puesto, sueldo, requisitos y deseables.
- [ ] En la página de inicio ves la lista de tus aplicaciones con su color de semáforo.
- [ ] Puedes cambiar el estado de una aplicación y se queda guardado.

<details>
<summary>🌱 Prompt semilla</summary>

```
Quiero registrar ofertas de trabajo. Haz una página /ofertas/nueva con un textarea
donde pego la oferta. La IA debe extraer: empresa, puesto, ubicación, modalidad,
sueldo, resumen, requisitos obligatorios, requisitos deseables, responsabilidades y
palabras clave (herramientas y habilidades concretas). Guárdalo en una tabla
"aplicaciones" junto con el texto original y un estado con 4 valores: sin respuesta,
más información, entrevista y declinada.
En la página de inicio muestra todas las aplicaciones con un círculo de color según
el estado, y en el detalle de cada una botones para cambiar el estado.
Primero dime tu plan.
```

</details>

---

## H3 · Comparación (25 min)

**Meta:** para cada aplicación, la app compara tu perfil con la oferta: qué cumples, qué te falta y qué deberías estudiar.

### Piensen antes de escribirle a la IA

- **¿Cómo saben si el modelo les está mintiendo?** Si dice "cumples con Git", ¿en qué parte de tu perfil lo vio?
- ¿Le piden a la IA un porcentaje de compatibilidad o lo calculan ustedes con código? ¿Qué es más confiable y por qué?
- ¿Pesa igual un requisito obligatorio que uno deseable?
- Si mejoras tu perfil, ¿la comparación vieja sigue siendo válida?

### Está listo cuando

- [ ] En el detalle de una aplicación hay un botón "Comparar con mi perfil".
- [ ] Ves cada requisito marcado como *cumple*, *parcial* o *no cumple*, con la **evidencia** sacada de tu perfil.
- [ ] Ves qué te falta y qué te conviene estudiar.
- [ ] Probaste a propósito con una oferta que **no** te queda y la app lo dice con honestidad.

<details>
<summary>🌱 Prompt semilla</summary>

```
En el detalle de cada aplicación agrega un botón "Comparar con mi perfil".
La IA debe revisar CADA requisito (obligatorio y deseable) y decir si lo cumplo,
lo cumplo parcialmente o no lo cumplo, citando como evidencia una frase copiada de
mi perfil, y si no lo cumplo, una acción concreta para cerrar la brecha.
También un resumen honesto y una lista de temas para estudiar.
NO le pidas el porcentaje a la IA: calcúlalo con código (los obligatorios valen doble).
Guarda el resultado en una tabla y muéstralo en una tabla con ✅ 🟡 ❌.
Primero dime tu plan.
```

Reto: *"Con código, revisa si la evidencia que dio la IA de verdad aparece en mi perfil y avísame si no."*

</details>

---

## H4 · CV a la medida (30 min)

**Meta:** para cada aplicación, la app genera un CV adaptado a esa oferta, que puedes imprimir como PDF y que un ATS (el programa que filtra CVs en las empresas) puede leer.

### Piensen antes de escribirle a la IA

- **¿Dónde está la línea entre resaltar y fabricar?** Reordenar y redactar mejor está bien. ¿Y agregar "React" porque la oferta lo pide?
- ¿Cómo revisas con **código** (no con más IA) que el CV no tenga nada que no esté en tu perfil?
- ¿Qué hace que un CV sea fácil de leer para un ATS? (Pista: una columna, títulos normales, sin tablas ni íconos.)
- Si mandas 10 CVs distintos, ¿cómo sabes después cuál mandaste a cada empresa?

### Está listo cuando

- [ ] En el detalle de una aplicación hay un botón "Generar CV".
- [ ] Ves el CV en una página limpia y lo puedes guardar como PDF (Imprimir → Guardar como PDF).
- [ ] La app te avisa si el CV tiene algo que no estaba en tu perfil.
- [ ] Queda guardado qué CV mandaste a cada aplicación.

<details>
<summary>🌱 Prompt semilla</summary>

```
En el detalle de cada aplicación agrega un botón "Generar CV a la medida".
La IA recibe mi perfil y la oferta y devuelve un CV con la misma forma que el perfil,
pero con lo más relevante primero, el titular y el resumen adaptados al puesto, y
logros con verbos de acción. Regla: puede resaltar, pero NUNCA agregar habilidades,
empresas, escuelas o números que no estén en mi perfil.
Después, con código, compara el CV contra mi perfil y muestra una alerta con lo que
no estaba en el perfil.
Muestra el CV en /cv/[id] en una sola columna, con títulos simples (Resumen,
Experiencia, Educación, Habilidades), sin tablas ni íconos, y un botón para imprimir.
Guarda cada CV en la base de datos ligado a su aplicación.
Primero dime tu plan.
```

</details>

---

## 🛟 Si te quedaste atrás: punto de control

Si se acaba el tiempo de un hito y tu app no funciona, **no pasa nada**: salta al punto de control y sigue con el siguiente hito. Tu trabajo no se pierde: se guarda en una rama aparte.

1. Detén la app en la terminal 1 con `Ctrl + C`.
2. Corre el rescate con el hito que **ya terminó**. Por ejemplo, para empezar H3 con H2 resuelto:

   ```
   npm run rescate h2
   ```

3. Vuelve a correr `npm run dev`.

| Para empezar… | Corre |
|---|---|
| H2 | `npm run rescate h1` |
| H3 | `npm run rescate h2` |
| H4 | `npm run rescate h3` |
| Ver la app terminada | `npm run rescate mvp` |

> Si el rescate falla (por ejemplo, porque tu carpeta no es un repositorio de git), descarga el ZIP del hito, descomprímelo, copia ahí tu archivo `.env.local` y corre `npm install`, `npm run db:push` y `npm run dev`:
> [h1](https://github.com/jmsv23/taller-cv-ia-/archive/refs/heads/h1.zip) · [h2](https://github.com/jmsv23/taller-cv-ia-/archive/refs/heads/h2.zip) · [h3](https://github.com/jmsv23/taller-cv-ia-/archive/refs/heads/h3.zip) · [h4](https://github.com/jmsv23/taller-cv-ia-/archive/refs/heads/h4.zip) · [mvp](https://github.com/jmsv23/taller-cv-ia-/archive/refs/heads/mvp.zip)

---

## Retos extra (si terminas antes)

- **Leer la oferta desde un link.** Pegas la URL y la app descarga la página. ¿Qué pasa con LinkedIn? ¿Por qué?
- **Carta de presentación** a la medida de cada oferta, con las mismas reglas de no inventar.
- **Recordatorios:** si una aplicación lleva más de 7 días *sin respuesta*, que la app te lo marque.
- **Filtros** en la página de inicio por estado del semáforo.
- **Piensa en grande (sin programarlo):** ¿cómo sería esto como **agente**, que busque ofertas solo, compare, genere el CV y te pregunte antes de mandarlo? ¿Y si leyera tus correos para cambiar el semáforo solo? ¿Qué podría salir mal?

---

## Si algo truena

| Lo que ves | Qué hacer |
|---|---|
| "Llegaste al límite de peticiones" / error 429 | Es el límite de los modelos gratis. Espera un minuto. Si sigue, corre `npm run check` para que elija otro modelo. |
| "La IA respondió, pero no con el formato que le pedimos" | Intenta otra vez. Si sigue, simplifica el esquema (menos campos) o cambia de modelo. |
| "Falta tu key de OpenRouter" | Corre `npm run check` y después reinicia `npm run dev`. |
| La página se queda cargando mucho rato | Los modelos gratis tardan de 10 a 60 segundos. Espera y no le des clic otra vez. |
| opencode dice que `generateObject` no existe | Dile: *"En esta versión se usa generateText con Output.object, lee AGENTS.md"*. |
| `npm run db:push` pregunta algo con flechitas | Lee la pregunta. Si no estás seguro, pregunta al instructor antes de borrar tablas. |
| Un cambio de estilos no aparece | Detén `npm run dev`, borra la carpeta `.next` y vuelve a correrlo. |
| opencode rompió todo | `/undo`. Si no basta, el rescate del hito anterior. |
| Nada de lo anterior | Levanta la mano 🙋 y ten a la mano una captura de **toda** la pantalla. |
