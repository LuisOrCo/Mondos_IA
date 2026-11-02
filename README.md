# mundos-ia

Programa de consola en Node.js para crear mundos imaginarios, generar descripciones artísticas detalladas con modelos de lenguaje y producir imágenes a partir de esas descripciones mediante Inteligencia Artificial.

---

## Servicios Utilizados

* **Generación de texto (Prompt):** [Groq Cloud](https://console.groq.com/)  
  Utiliza el modelo rápido `llama-3.3-70b-versatile` para transformar la situación, el tipo de mundo y los colores en un prompt visual detallado en inglés.
* **Generación de imágenes:** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)  
  Utiliza el modelo `@cf/black-forest-labs/flux-1-schnell` para procesar la descripción y generar una imagen artística en formato JPG de alta calidad.

---

## Requisitos Previos

* Node.js v20.6.0 o superior (compatible con `fetch` nativo y `process.loadEnvFile`).
* Dependencia `object-hash` instalada.

---

## Configuración

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Copia la plantilla de variables de entorno a un archivo `.env`:
   * En Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   * En Linux / macOS / Bash:
     ```bash
     cp .env.example .env
     ```

3. Abre el archivo `.env` y coloca tus claves de acceso:
   ```env
   GROQ_API_KEY=tu_api_key_de_groq_aqui
   CLOUDFLARE_ACCOUNT_ID=tu_account_id_de_cloudflare_aqui
   CLOUDFLARE_API_TOKEN=tu_api_token_de_cloudflare_aqui
   ```

---

## Modo de Uso

Ejecuta el programa pasando entre comillas la **situación**, el **tipo de mundo** y **exactamente 5 colores**:

```bash
node src/index.js "Un bosque mágico iluminado por luciérnagas" "Fantasía mística" "verde" "marrón" "dorado" "azul" "violeta"
```

### Flujo de Ejecución:
1. **Paso 1:** Genera un identificador único de 8 caracteres a partir de los datos y guarda la configuración en `data/mundo_<id>.json`.
2. **Paso 2:** Envía los datos a Groq y almacena la descripción en `descripciones/mundo_<id>.txt` (si ya existe localmente, se reutiliza sin gastar peticiones).
3. **Paso 3:** Envía la descripción a Cloudflare Workers AI y guarda la imagen en `imagenes/mundo_<id>.jpg` (si ya existe localmente, se reutiliza).

---

## Estructura de Carpetas

```text
mundos_ia/
├── .env.example               # Plantilla de variables de entorno
├── .gitignore                 # Reglas de exclusión para Git
├── package.json               # Configuración y dependencias de npm
├── README.md                  # Documentación del proyecto
├── src/
│   ├── index.js               # Punto de entrada y orquestador del programa
│   ├── mundo.js               # Cálculo de id con hash, creación y guardado del JSON
│   ├── texto.js               # Conexión nativa con la API de Groq
│   └── imagen.js              # Conexión nativa con la API de Cloudflare Workers AI
├── data/                      # Archivos mundo_<id>.json generados localmente
├── descripciones/             # Archivos mundo_<id>.txt con descripciones generadas
└── imagenes/                  # Archivos mundo_<id>.jpg con las imágenes creadas
```
