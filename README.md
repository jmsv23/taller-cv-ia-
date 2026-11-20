# Taller: tu buscador de empleo con IA

¡Hola! En el taller vamos a construir, con ayuda de la IA, una app que:

- lee tu CV y lo convierte en un perfil ordenado,
- guarda las ofertas de trabajo que te interesan y cómo va cada aplicación,
- te dice qué cumples, qué te falta y qué te convendría estudiar para cada oferta,
- te arma un CV a la medida de cada oferta.

Para no perder tiempo el día del taller, **necesito que hagas esta tarea previa antes del miércoles 25 de noviembre a las 20:00**. Son unos 30 o 45 minutos y no necesitas saber programar: solo copiar, pegar y seguir los pasos con calma.

> 💡 Si nunca has usado una terminal, no pasa nada. Aquí vas a aprender lo justo.

---

## ¿Qué vamos a instalar?

| Herramienta | Para qué sirve |
|---|---|
| **Node.js** | Es lo que ejecuta la app en tu computadora. |
| **Git** | Sirve para descargar el proyecto (y deshacer cambios si algo sale mal). |
| **opencode** | Es el agente de IA que va a escribir código contigo. Es la herramienta principal del taller. |
| **Cuenta de OpenRouter** | Le da a tu app acceso a modelos de IA (gratis). |
| **Cuenta de OpenCode Zen** | Le da a opencode acceso a modelos de IA (gratis). |

Las cuentas son **gratis**. Más abajo te cuento de una opción de pago que es **opcional**.

---

## Paso 1. Abre una terminal

La terminal es una ventana donde escribes comandos. Cada vez que veas un bloque como este:

```
algo que escribir
```

cópialo, pégalo en la terminal y presiona **Enter**.

### 🪟 Windows

1. Presiona la tecla **Windows**, escribe **Terminal** (o **PowerShell** si no aparece) y ábrela.
2. Pega este comando una sola vez y presiona Enter (permite que funcionen `npm` y `opencode`):

   ```
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   Si te pregunta algo, escribe `S` (o `Y`) y presiona Enter.

> Para pegar en la terminal de Windows: clic derecho, o **Ctrl + V**.

### 🍎 Mac

Presiona **Cmd + Espacio**, escribe **Terminal** y presiona Enter.

> Para pegar: **Cmd + V**.

### 🐧 Linux

Abre la aplicación **Terminal** (en muchas distros también se abre con **Ctrl + Alt + T**).

> Para pegar: **Ctrl + Shift + V**.

---

## Paso 2. Instala Node.js

### 🪟 Windows y 🍎 Mac

1. Entra a **https://nodejs.org**.
2. Descarga la versión que dice **LTS** (el instalador `.msi` en Windows o `.pkg` en Mac).
3. Ábrelo y dale **Siguiente** a todo.
   - 🪟 En Windows, si aparece una casilla que dice *"Automatically install the necessary tools"*, **déjala sin marcar**. No la necesitamos y tarda muchísimo.
4. **Cierra la terminal y ábrela de nuevo** (si no, no se entera de que instalaste Node).

### 🐧 Linux

Usaremos **nvm**, que funciona igual en cualquier distro. Pega esto:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
```

**Cierra la terminal y ábrela de nuevo**. Después:

```
nvm install --lts
```

> Si dice que `curl` no existe: en Ubuntu/Debian corre `sudo apt install curl`, en Fedora `sudo dnf install curl` y vuelve a intentar.

### ✅ ¿Cómo sé que funcionó?

```
node --version
```

Debe aparecer algo como `v26.x.x` o `v24.x.x`.

---

## Paso 3. Instala Git

### 🪟 Windows

1. Entra a **https://git-scm.com/downloads/win** y descarga el instalador.
2. Dale **Next** a todo, sin cambiar nada.
3. **Cierra la terminal y ábrela de nuevo.**

### 🍎 Mac

```
xcode-select --install
```

Te va a aparecer una ventana: dale **Instalar** y espera (puede tardar unos minutos).

### 🐧 Linux

Normalmente ya viene instalado. Si no:

- Ubuntu / Debian / Mint: `sudo apt install git`
- Fedora: `sudo dnf install git`
- Arch / Manjaro: `sudo pacman -S git`

### ✅ ¿Cómo sé que funcionó?

```
git --version
```

Debe aparecer algo como `git version 2.x.x`.

---

## Paso 4. Instala opencode

opencode es el agente de IA con el que vas a construir la app. Es lo más importante del taller, así que vale la pena dejarlo bien.

En **los tres sistemas** es el mismo comando:

```
npm i -g opencode-ai
```

Cuando termine, **cierra la terminal y ábrela de nuevo**.

### ✅ ¿Cómo sé que funcionó?

```
opencode --version
```

Debe aparecer un número de versión.

> ❗ ¿Algo falló? Revisa **Errores comunes** al final de esta guía. Hay una solución para cada sistema.

---

## Paso 5. Crea tus cuentas de IA

### 5.1 OpenRouter (para la app)

1. Entra a **https://openrouter.ai** y crea una cuenta (puedes usar tu cuenta de Google).
2. Ve a **https://openrouter.ai/settings/keys** y presiona **Create Key**.
3. Ponle de nombre `taller` y créala.
4. **Copia la key** (empieza con `sk-or-`) y guárdala en un lugar seguro, por ejemplo en una nota. Solo te la muestran una vez.

> 🔒 Tu key es como una contraseña: no la compartas ni la subas a internet.

#### ¿Cómo funcionan los modelos gratis de OpenRouter?

En el taller usamos modelos **gratis**: su nombre termina en `:free` (por ejemplo `nvidia/nemotron-3.5-super-vl:free`). No te cobran nada por usarlos, pero tienen **límites de uso**:

| Tu cuenta | Peticiones por minuto | Peticiones por día | Costo |
|---|---|---|---|
| Sin créditos (o menos de 10 USD comprados en total) | 20 | **50** | 0 USD |
| Con al menos 10 USD comprados alguna vez | 20 | **1,000** | 0 USD |

¿Qué significa esto en la práctica?

- **Una petición es una pregunta a la IA.** Cada vez que la app lee un CV, analiza una oferta o genera un CV, gasta una petición (a veces más).
- **Con la cuenta gratis tienes 50 al día.** Alcanza para el taller si no le picas al botón de más.
- **Si llegas al límite**, vas a ver un error **429**. No se rompió nada: espera un minuto (si fue el límite por minuto) o al día siguiente (si fue el límite por día).
- **Si compras 10 USD de créditos una vez**, el límite sube a 1,000 al día *para siempre*, y esos créditos **no se gastan** mientras uses solo modelos `:free`. Es opcional.

> ⚠️ **No uses tu cuenta de OpenRouter dentro de opencode con modelos gratis.** opencode hace muchas peticiones por cada cosa que le pides y te acabaría tus 50 peticiones del día en minutos. Para opencode usa **OpenCode Zen** (abajo) u **OpenCode Go**. OpenRouter queda solo para la app.

### 5.2 OpenCode Zen (para opencode)

1. Entra a **https://opencode.ai/zen** e inicia sesión.
2. Crea una **API key** y cópiala.

### 5.3 (Opcional) OpenCode Go: 10 USD

Las cuentas gratis tienen un límite de uso al día. Para el taller **alcanzan**, pero si te quedas sin peticiones a la mitad, es frustrante.

Si puedes, **te recomiendo la suscripción OpenCode Go (10 USD)** en **https://opencode.ai/go**. Le da a opencode acceso a buenos modelos abiertos con límites mucho más holgados. Mejora bastante la experiencia, pero **no es obligatoria**.

---

## Paso 6. Conecta opencode con tus cuentas

```
opencode auth login
```

1. Te va a aparecer una lista. Busca **OpenCode Zen** (puedes escribir para filtrar), selecciónalo con las flechas y presiona Enter.
2. Pega tu key de OpenCode Zen y presiona Enter.
3. Si contrataste **OpenCode Go**, corre otra vez `opencode auth login` y conéctalo también.

> No conectes OpenRouter aquí: tu key de OpenRouter es solo para la app (la pide `npm run check` en el paso 8).

---

## Paso 7. Descarga el proyecto

```
git clone https://github.com/jmsv23/taller-cv-ia-.git
```

```
cd taller-cv-ia-
```

```
npm install
```

El último tarda uno o dos minutos. Es normal que salgan mensajes amarillos (`warn`); solo importan los que dicen `ERR!`.

---

## Paso 8. Verifica que todo esté listo

Este comando revisa todo por ti:

```
npm run check
```

Te va a pedir tu **key de OpenRouter**: pégala y presiona Enter. El script la guarda por ti (en un archivo llamado `.env.local`), así que no tienes que editar nada.

Si todo salió bien, al final vas a ver:

```
✅ ¡Todo listo! Nos vemos en el taller.
```

Si ves ❌, cada problema trae una flecha **→** con lo que tienes que hacer. Arréglalo y vuelve a correr `npm run check` las veces que haga falta.

---

## Paso 9. Saluda a opencode

Dentro de la carpeta del proyecto (`taller-cv-ia-`), escribe:

```
opencode
```

1. Escribe `/models` y presiona Enter. Elige un modelo **gratis de OpenCode Zen** (o uno de OpenCode Go, si lo contrataste).
2. Escríbele: **explícame qué hay en este proyecto**.
3. Si te contesta, ¡ya está! Sal con **Ctrl + C**.

(Opcional) Para ver la app: corre `npm run dev`, abre **http://localhost:3000** en tu navegador y hazle una pregunta a la IA. Para detenerla, **Ctrl + C** en la terminal.

---

## Paso 10. Avisa que estás listo

Toma una **captura de pantalla** del mensaje verde `✅ ¡Todo listo!` y mándala por el canal que te indicaron, **antes del miércoles 25 a las 20:00**.

Si te trabaste, manda una captura de **toda la pantalla de la terminal** y dinos en qué paso te quedaste. Te ayudamos.

---

## Errores comunes

### 🪟 Windows

- **"la ejecución de scripts está deshabilitada en este sistema"** (o *"running scripts is disabled"*): no hiciste el comando del paso 1. Corre `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y vuelve a intentar.
- **"node / git / opencode no se reconoce como un comando"**: cierra **todas** las terminales y abre una nueva. Si sigue igual, reinicia la computadora.
- **Tu laptop tiene procesador Snapdragon / ARM** (por ejemplo, algunas Surface) y `npm run check` falla en "Base de datos": desinstala Node e instala la versión **x64** desde https://nodejs.org/en/download (en vez de la ARM64).
- **El antivirus bloquea algo durante `npm install`**: permite el acceso y vuelve a correr `npm install`.

### 🍎 Mac

- **`npm i -g opencode-ai` dice `EACCES` o "permission denied"**: no uses `sudo`. Instala opencode con este comando:

  ```
  curl -fsSL https://opencode.ai/install | bash
  ```

  Cierra la terminal, ábrela de nuevo y prueba `opencode --version`.
- **"xcrun: error: invalid active developer path"**: corre `xcode-select --install` (paso 3).
- **"command not found: opencode"** después de instalar: cierra la terminal y abre una nueva.

### 🐧 Linux

- **"nvm: command not found"**: cierra la terminal y abre una nueva. Si sigue, corre `source ~/.bashrc` (o `source ~/.zshrc` si usas zsh).
- **`npm i -g` pide `sudo` o falla con `EACCES`**: no estás usando el Node de nvm. Corre `nvm use --lts` y vuelve a intentar (sin `sudo`).
- **Otra opción para instalar opencode**: `curl -fsSL https://opencode.ai/install | bash`.

### En cualquier sistema

- **`npm run check` dice que la key no es válida**: crea otra en https://openrouter.ai/settings/keys y vuelve a correr `npm run check`.
- **"llegaste al límite de peticiones" (error 429)**: los modelos gratis tienen límite. Espera un rato y vuelve a intentar.
- **`git clone` dice que la carpeta ya existe**: ya lo descargaste. Solo entra con `cd taller-cv-ia-`.
- **No sé en qué carpeta estoy**: cierra la terminal, ábrela de nuevo y escribe `cd taller-cv-ia-`.

---

## Para los curiosos (no es necesario para el taller)

- `src/app/page.tsx`: la página de inicio.
- `src/app/actions.ts`: ejemplo de cómo llamar a la IA y guardar en la base de datos.
- `src/db/schema.ts`: las tablas de la base de datos.
- `src/lib/ai.ts`: la conexión con el modelo de IA.
- `AGENTS.md`: instrucciones que lee opencode para entender el proyecto.
