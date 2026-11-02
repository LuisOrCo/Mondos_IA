// Paso 1: Importar los módulos nativos fs y path, y la función leerMundo
const fs = require('fs');
const path = require('path');
const { leerMundo } = require('./mundo');

// Paso 2: Función asíncrona para generar o recuperar la descripción de la imagen
async function generarDescripcion(id) {
  // Paso 3: Preparar las rutas de la carpeta descripciones y del archivo de texto
  const carpetaDescripciones = path.join(__dirname, '..', 'descripciones');
  const rutaArchivo = path.join(carpetaDescripciones, `mundo_${id}.txt`);

  // Paso 4: Comprobar si el archivo ya existe para no volver a llamar a la API
  if (fs.existsSync(rutaArchivo)) {
    console.log(`[Cache] La descripción ya existe para el mundo ${id}. Leyendo desde disco...`);
    return fs.readFileSync(rutaArchivo, 'utf-8');
  }

  // Paso 5: Leer los datos del mundo en formato JSON usando la función leerMundo
  const datos = leerMundo(id);

  // Paso 6: Validar que la API key de Groq esté definida en las variables de entorno
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la variable GROQ_API_KEY en el archivo .env');
  }

  // Paso 7: Obtener el modelo configurado o usar un modelo activo por defecto
  const modelo = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  // Paso 8: Construir el prompt detallado con la situación, el mundo y los colores
  const coloresTexto = datos.colores.join(', ');
  const prompt = `Actúa como un experto en generación de imágenes. Describe detalladamente una escena visual en inglés para un generador de imágenes artísticas, basada en: Mundo: ${datos.mundo}. Situación: ${datos.situacion}. Colores principales: ${coloresTexto}. Responde únicamente con la descripción en inglés.`;

  // Paso 9: Enviar la petición fetch a la API de Groq usando async/await y try/catch
  try {
    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    // Paso 10: Convertir la respuesta a JSON
    const datosRespuesta = await respuesta.json();

    // Paso 11: Verificar si la respuesta HTTP fue exitosa y reportar detalle si falla
    if (!respuesta.ok) {
      const detalleError = datosRespuesta.error && datosRespuesta.error.message
        ? datosRespuesta.error.message
        : `Código de estado ${respuesta.status}`;
      throw new Error(`Error en la API de Groq: ${detalleError}`);
    }

    // Paso 12: Extraer el texto generado por el modelo
    const descripcion = datosRespuesta.choices[0].message.content.trim();

    // Paso 13: Asegurar que la carpeta descripciones exista antes de guardar
    if (!fs.existsSync(carpetaDescripciones)) {
      fs.mkdirSync(carpetaDescripciones, { recursive: true });
    }

    // Paso 14: Guardar la descripción generada en el archivo txt correspondiente
    fs.writeFileSync(rutaArchivo, descripcion);
    console.log(`[Groq] Descripción generada y guardada con éxito en ${rutaArchivo}`);

    // Paso 15: Retornar la descripción obtenida
    return descripcion;
  } catch (error) {
    // Paso 16: Personalizar el mensaje si ocurre un error de red o fetch
    let mensajeError = error.message;
    if (error.message.toLowerCase().includes('fetch')) {
      mensajeError = 'failed to fetch revisa la conexión o la URL del servicio que estás intentando acceder';
    }
    console.error(`Ocurrió un error al generar la descripción: ${mensajeError}`);
    throw new Error(mensajeError);
  }
}

// Paso 17: Exportar la función generarDescripcion para usarla con require
module.exports = {
  generarDescripcion
};
