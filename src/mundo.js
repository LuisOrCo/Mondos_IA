// Paso 1: Importar los módulos nativos fs y path, y la librería object-hash
const fs = require('fs');
const path = require('path');
const objectHash = require('object-hash');

// Paso 2: Crear el objeto mundo calculando el id con los primeros 8 caracteres del hash
function crearMundo(args) {
  // Paso 3: Extraer la situación, el mundo y los colores desde el arreglo o el objeto recibido
  const situacion = Array.isArray(args) ? args[0] : args.situacion;
  const mundo = Array.isArray(args) ? args[1] : args.mundo;
  const colores = Array.isArray(args) ? args.slice(2) : args.colores;

  // Paso 4: Calcular el hash únicamente sobre situación, mundo y colores
  const datosParaHash = {
    situacion: situacion,
    mundo: mundo,
    colores: colores
  };
  const id = objectHash(datosParaHash).slice(0, 8);

  // Paso 5: Retornar el objeto mundo agregando creadoEn sin alterar el hash
  return {
    id: id,
    situacion: situacion,
    mundo: mundo,
    colores: colores,
    creadoEn: new Date().toISOString()
  };
}

// Paso 6: Guardar el objeto mundo en la carpeta data con formato JSON
function guardarMundo(mundo) {
  // Paso 7: Definir la carpeta data y crearla con recursive true si no existe
  const carpetaData = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(carpetaData)) {
    fs.mkdirSync(carpetaData, { recursive: true });
  }

  // Paso 8: Construir la ruta final y guardar el archivo JSON formateado
  const ruta = path.join(carpetaData, `mundo_${mundo.id}.json`);
  fs.writeFileSync(ruta, JSON.stringify(mundo, null, 2));

  // Paso 9: Retornar la ruta del archivo generado
  return ruta;
}

// Paso 10: Leer el archivo JSON a partir de su ruta en disco
function leerMundo(ruta) {
  // Paso 11: Leer el contenido del archivo y convertirlo a objeto JavaScript
  const rutaFinal = ruta.endsWith('.json')
    ? ruta
    : path.join(__dirname, '..', 'data', `mundo_${ruta}.json`);
  const contenido = fs.readFileSync(rutaFinal, 'utf-8');
  return JSON.parse(contenido);
}

// Paso 12: Exportar las funciones requeridas para su uso con require
module.exports = {
  crearMundo,
  guardarMundo,
  leerMundo
};
