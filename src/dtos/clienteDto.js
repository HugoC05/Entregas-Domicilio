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

export function clienteDesdeEntrada(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ErrorValidacion('El cuerpo de la petición debe ser un objeto JSON');
  }
  return {
    nombre: texto(body.nombre, 'nombre'),
    correo: correo(body.correo),
    telefono: telefono(body.telefono),
    direccion: texto(body.direccion, 'direccion', 200),
  };
}

export const clienteSalida = (c) => ({
  id: c._id,
  nombre: c.nombre,
  correo: c.correo,
  telefono: c.telefono,
  direccion: c.direccion,
  imagen: c.imagenTipo ? `/api/clientes/${c._id}/imagen` : null,
});