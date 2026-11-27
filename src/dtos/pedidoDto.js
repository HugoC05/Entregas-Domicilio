import { ErrorValidacion } from '../errores/errores.js';

export const ESTADOS = ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];

function texto(valor, campo, max = 100) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErrorValidacion(`El campo "${campo}" es obligatorio`);
  }
  const limpio = valor.trim();
  if (limpio.length > max) throw new ErrorValidacion(`El campo "${campo}" admite máximo ${max} caracteres`);
  return limpio;
}

function entero(valor, campo) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorValidacion(`"${campo}" debe ser un número entero positivo`);
  return n;
}

function objeto(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ErrorValidacion('El cuerpo de la petición debe ser un objeto JSON');
  }
  return body;
}

export const idDesdeEntrada = (valor) => entero(valor, 'id');

export function pedidoCrearDesdeEntrada(body) {
  const b = objeto(body);
  return {
    clienteId: entero(b.clienteId, 'clienteId'),
    descripcion: texto(b.descripcion, 'descripcion', 255),
  };
}

export function pedidoActualizarDesdeEntrada(body) {
  const b = objeto(body);
  const dto = {};
  if (b.descripcion !== undefined) dto.descripcion = texto(b.descripcion, 'descripcion', 255);
  if (b.repartidorId !== undefined) dto.repartidorId = b.repartidorId === null ? null : entero(b.repartidorId, 'repartidorId');
  if (b.estado !== undefined) {
    if (!ESTADOS.includes(b.estado)) throw new ErrorValidacion(`"estado" debe ser uno de: ${ESTADOS.join(', ')}`);
    dto.estado = b.estado;
  }
  if (Object.keys(dto).length === 0) throw new ErrorValidacion('No se envió ningún campo para actualizar');
  return dto;
}

export const pedidoSalida = (p) => ({
  id: p._id,
  clienteId: p.clienteId?._id ?? p.clienteId,
  clienteNombre: p.clienteId?.nombre,
  repartidorId: p.repartidorId?._id ?? null,
  repartidorNombre: p.repartidorId?.nombre ?? null,
  descripcion: p.descripcion,
  direccionEntrega: p.direccionEntrega,
  estado: p.estado,
  imagen: p.imagenTipo ? `/api/pedidos/${p._id}/imagen` : null,
});