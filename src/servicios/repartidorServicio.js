import { ErrorConflicto, ErrorNoEncontrado } from '../errores/errores.js';
import { siguienteId } from '../baseDeDatos/contador.js';

export function crearRepartidorServicio({ Repartidor, Pedido }) {
  const obtener = async (id) => {
    const repartidor = await Repartidor.findById(id).lean();
    if (!repartidor) throw new ErrorNoEncontrado(`No existe el repartidor con id ${id}`);
    return repartidor;
  };

  const validarCorreo = async (correo, idPropio) => {
    const filtro = { correo };
    if (idPropio) filtro._id = { $ne: idPropio };
    if (await Repartidor.findOne(filtro).lean()) throw new ErrorConflicto('Ya existe un repartidor con ese correo');
  };

  return {
    obtener,
    listar: () => Repartidor.find().sort({ _id: 1 }).lean(),
    async crear(datos) {
      await validarCorreo(datos.correo);
      const repartidor = await Repartidor.create({ _id: await siguienteId('repartidores'), ...datos });
      return repartidor.toObject();
    },
    async actualizar(id, datos) {
      await obtener(id);
      await validarCorreo(datos.correo, id);
      return Repartidor.findByIdAndUpdate(id, datos, { returnDocument: 'after', runValidators: true }).lean();
    },
    async cambiarDisponibilidad(id, disponible) {
      await Repartidor.findByIdAndUpdate(id, { disponible });
    },
    async eliminar(id) {
      await obtener(id);
      if (await Pedido.exists({ repartidorId: id })) {
        throw new ErrorConflicto('No se puede eliminar: el repartidor tiene pedidos asignados');
      }
      await Repartidor.findByIdAndDelete(id);
    },
    async guardarImagen(id, imagen) {
      await obtener(id);
      await Repartidor.findByIdAndUpdate(id, { imagenDatos: imagen.datos, imagenTipo: imagen.tipo });
      return obtener(id);
    },
    async obtenerImagen(id) {
      await obtener(id);
      const registro = await Repartidor.findById(id).select('+imagenDatos');
      if (!registro.imagenDatos) throw new ErrorNoEncontrado('El repartidor no tiene imagen');
      return { datos: registro.imagenDatos, tipo: registro.imagenTipo };
    },
  };
}
