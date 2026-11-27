import { ErrorValidacion } from '../errores/errores.js';

function texto(valor, campo, max = 100) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErrorValidacion(`El campo "${campo}" es obligatorio`);
  }
  const limpio = valor.trim();
  if (limpio.length > max) throw new ErrorValidacion(`El campo "${campo}" admite máximo ${max} caracteres`);
  return limpio;
}

function correo(valor) {
  const limpio = texto(valor, 'correo', 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) throw new ErrorValidacion('El campo "correo" no es un correo válido');
  return limpio;
}

function telefono(valor) {
  const digitos = texto(valor, 'telefono', 10);
  if (digitos.length !== 10) {
    throw new ErrorValidacion('El campo "telefono" debe tener exactamente 10 dígitos');
  }
  return digitos;
}

export function idDesdeEntrada(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorValidacion('"id" debe ser un número entero positivo');
  return n;
}

export function repartidorDesdeEntrada(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ErrorValidacion('El cuerpo de la petición debe ser un objeto JSON');
  }
  if (body.disponible !== undefined && typeof body.disponible !== 'boolean') {
    throw new ErrorValidacion('El campo "disponible" debe ser true o false');
  }
  return {
    nombre: texto(body.nombre, 'nombre'),
    correo: correo(body.correo),
    telefono: telefono(body.telefono),
    vehiculo: texto(body.vehiculo, 'vehiculo', 50),
    disponible: body.disponible ?? true,
  };
}

export const repartidorSalida = (r) => ({
  id: r._id,
  nombre: r.nombre,
  correo: r.correo,
  telefono: r.telefono,
  vehiculo: r.vehiculo,
  disponible: r.disponible,
  imagen: r.imagenTipo ? `/api/repartidores/${r._id}/imagen` : null,
});