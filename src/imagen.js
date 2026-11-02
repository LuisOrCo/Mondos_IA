// Paso 1: Importar los módulos nativos fs y path
const fs = require('fs');
const path = require('path');

// Paso 2: Función asíncrona para generar y guardar la imagen a partir de la descripción
async function generarImagen(id, descripcionTexto) {
  // Paso 3: Preparar las rutas de la carpeta imagenes y del archivo jpg
  const carpetaImagenes = path.join(__dirname, '..', 'imagenes');
  const rutaArchivo = path.join(carpetaImagenes, `mundo_${id}.jpg`);

  // Paso 4: Comprobar si la imagen ya existe para no volver a llamar a la API
  if (fs.existsSync(rutaArchivo)) {
    console.log(`[Cache] La imagen ya existe para el mundo ${id}.`);
    return rutaArchivo;
  }

  // Paso 5: Obtener la descripción recibida o leerla desde el archivo de texto
  let descripcion = descripcionTexto;
  if (!descripcion) {
    const rutaTxt = path.join(__dirname, '..', 'descripciones', `mundo_${id}.txt`);
    descripcion = fs.readFileSync(rutaTxt, 'utf-8');
  }

  // Paso 6: Validar que las credenciales de Cloudflare existan en las variables de entorno
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error('Faltan CLOUDFLARE_ACCOUNT_ID o CLOUDFLARE_API_TOKEN en el archivo .env');
  }

  // Paso 7: Enviar la petición fetch a la API de Cloudflare Workers AI con try/catch
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: descripcion
      })
    });

    // Paso 8: Verificar que la respuesta HTTP sea correcta
    if (!respuesta.ok) {
      throw new Error(`Error en la API de Cloudflare con código de estado ${respuesta.status}`);
    }

    // Paso 9: Extraer los datos binarios de la imagen según el formato devuelto
    const tipoContenido = respuesta.headers.get('content-type') || '';
    let bufferImagen;

    if (tipoContenido.includes('application/json')) {
      const datosJson = await respuesta.json();
      if (!datosJson.result || !datosJson.result.image) {
        throw new Error('La respuesta de Cloudflare no contiene la imagen esperada');
      }
      bufferImagen = Buffer.from(datosJson.result.image, 'base64');
    } else {
      const arrayBuffer = await respuesta.arrayBuffer();
      bufferImagen = Buffer.from(arrayBuffer);
    }

    // Paso 10: Asegurar que la carpeta imagenes exista antes de guardar
    if (!fs.existsSync(carpetaImagenes)) {
      fs.mkdirSync(carpetaImagenes);
    }

    // Paso 11: Guardar la imagen binaria en disco con formato jpg
    fs.writeFileSync(rutaArchivo, bufferImagen);
    console.log(`[Cloudflare] Imagen generada y guardada con éxito en ${rutaArchivo}`);

    // Paso 12: Retornar la ruta del archivo de la imagen creada
    return rutaArchivo;
  } catch (error) {
    console.error(`Ocurrió un error al generar la imagen: ${error.message}`);
    throw error;
  }
}

// Paso 13: Exportar la función generarImagen para usarla con require
module.exports = {
  generarImagen
};
