import { ErrorApp, ErrorNoEncontrado } from './errores.js';

export function rutaNoEncontrada(req, res, next) {
  next(new ErrorNoEncontrado(`No existe la ruta ${req.method} ${req.originalUrl}`));
}

export function manejadorErrores(err, req, res, _next) {
  if (err instanceof ErrorApp) {
    return res.status(err.estado).json({ error: err.message, detalles: err.detalles });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido' });
  }
  if (err.name === 'MulterError') {
    const mensaje = err.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen pesa más de 2 MB'
      : 'Envía solo una imagen en el campo "imagen"';
    return res.status(400).json({ error: mensaje });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único (correo o teléfono)' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}