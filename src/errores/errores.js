export class ErrorApp extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.detalles = detalles;
  }
}
export class ErrorValidacion extends ErrorApp {
  constructor(mensaje, detalles) { super(400, mensaje, detalles); }
}
export class ErrorNoEncontrado extends ErrorApp {
  constructor(mensaje) { super(404, mensaje); }
}
export class ErrorConflicto extends ErrorApp {
  constructor(mensaje) { super(409, mensaje); }
}
