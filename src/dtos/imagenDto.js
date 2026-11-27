import { ErrorValidacion } from '../errores/errores.js';

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function imagenDesdeEntrada(archivo) {
  if (!archivo) throw new ErrorValidacion('Envía la imagen en el campo "imagen" (form-data, tipo File)');
  const datos = archivo.buffer;
  let tipo = null;
  if (datos.length > 3 && datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff) tipo = 'image/jpeg';
  else if (datos.length > 8 && datos.subarray(0, 8).equals(FIRMA_PNG)) tipo = 'image/png';
  if (!tipo) throw new ErrorValidacion('La imagen debe ser PNG o JPG');
  return { datos, tipo };
}