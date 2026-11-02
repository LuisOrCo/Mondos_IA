// Paso 1: Importar los módulos nativos fs y path
const fs = require('fs');
const path = require('path');

// Paso 2: Cargar las variables de entorno desde el archivo .env con process.loadEnvFile
const rutaEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(rutaEnv)) {
  process.loadEnvFile(rutaEnv);
}

// Paso 3: Importar las funciones de los módulos creados
const { crearMundo, guardarMundo } = require('./mundo');
const { generarDescripcion } = require('./texto');
const { generarImagen } = require('./imagen');

// Paso 4: Función principal asíncrona para orquestar la ejecución del programa
async function main() {
  try {
    // Paso 5: Extraer los argumentos pasados por consola usando process.argv
    const argumentos = process.argv.slice(2);
    const situacion = argumentos[0];
    const mundo = argumentos[1];
    const colores = argumentos.slice(2);

    // Paso 6: Validar que se hayan recibido la situación, el mundo y exactamente 5 colores
    if (!situacion || !mundo || colores.length !== 5) {
      console.log('Error: Debes proporcionar una situación, un tipo de mundo y exactamente 5 colores.');
      console.log('Ejemplo de uso: node src/index.js "Batalla épica" "Ciberpunk" "rojo" "azul" "verde" "amarillo" "negro"');
      return;
    }

    console.log('--- Iniciando mundos-ia ---');

    // Paso 7: Crear el objeto mundo con el id de 8 caracteres y guardarlo en el archivo JSON
    const nuevoMundo = crearMundo(argumentos);
    const rutaJson = guardarMundo(nuevoMundo);
    console.log(`Paso 1 completado: Mundo guardado con ID [${nuevoMundo.id}] en ${rutaJson}`);

    // Paso 8: Generar o recuperar la descripción de la imagen con la API de Groq
    console.log('Paso 2: Procesando la descripción del mundo...');
    const descripcion = await generarDescripcion(nuevoMundo.id);

    // Paso 9: Generar o recuperar la imagen con la API de Cloudflare
    console.log('Paso 3: Procesando la generación de la imagen...');
    const rutaImagen = await generarImagen(nuevoMundo.id, descripcion);

    // Paso 10: Mostrar mensaje de éxito final con la ruta de la imagen creada
    console.log('--- Proceso finalizado con éxito ---');
    console.log(`Imagen lista en: ${rutaImagen}`);

  } catch (error) {
    // Paso 11: Capturar y mostrar cualquier error ocurrido durante el flujo
    console.error(`Error en la ejecución de mundos-ia: ${error.message}`);
  }
}

// Paso 12: Ejecutar la función principal del programa
main();
