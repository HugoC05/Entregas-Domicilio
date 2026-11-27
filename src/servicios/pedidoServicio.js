import { ErrorConflicto, ErrorNoEncontrado } from '../errores/errores.js';
import { siguienteId } from '../baseDeDatos/contador.js';

const TRANSICIONES = {
  PENDIENTE: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export function crearPedidoServicio({ Pedido }, clienteServicio, repartidorServicio) {
  const buscar = async (id) => {
    const pedido = await Pedido.findById(id).lean();
    if (!pedido) throw new ErrorNoEncontrado(`No existe el pedido con id ${id}`);
    return pedido;
  };
  const poblar = (consulta) => consulta.populate('clienteId', 'nombre').populate('repartidorId', 'nombre').lean();

  return {
    listar: () => poblar(Pedido.find().sort({ _id: 1 })),
    async obtener(id) {
      await buscar(id);
      return poblar(Pedido.findById(id));
    },

    async crear({ clienteId, descripcion }) {
      const cliente = await clienteServicio.obtener(clienteId);
      const pedido = await Pedido.create({
        _id: await siguienteId('pedidos'), clienteId, descripcion, direccionEntrega: cliente.direccion,
      });
      return poblar(Pedido.findById(pedido._id));
    },

    async actualizar(id, cambios) {
      const pedido = await buscar(id);
      if (pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO') {
        throw new ErrorConflicto(`El pedido está ${pedido.estado} y ya no se puede modificar`);
      }
      const cambiaEstado = cambios.estado && cambios.estado !== pedido.estado;
      const repartidorActual = pedido.repartidorId ?? null;
      const repartidorNuevo = cambios.repartidorId !== undefined ? cambios.repartidorId : repartidorActual;

      if (cambios.repartidorId) await repartidorServicio.obtener(cambios.repartidorId);

      if (pedido.estado === 'EN_CAMINO' && repartidorNuevo !== repartidorActual) {
        throw new ErrorConflicto('No se puede cambiar el repartidor de un pedido EN_CAMINO');
      }

      if (cambiaEstado && !TRANSICIONES[pedido.estado].includes(cambios.estado)) {
        throw new ErrorConflicto(`No se puede pasar de ${pedido.estado} a ${cambios.estado}`);
      }

      if (cambiaEstado && cambios.estado === 'EN_CAMINO') {
        if (!repartidorNuevo) throw new ErrorConflicto('Asigna un repartidor antes de poner el pedido EN_CAMINO');
        const repartidor = await repartidorServicio.obtener(repartidorNuevo);
        if (!repartidor.disponible) throw new ErrorConflicto(`El repartidor ${repartidor.nombre} no está disponible`);
        await repartidorServicio.cambiarDisponibilidad(repartidorNuevo, false);
      }

      if (cambiaEstado && pedido.estado === 'EN_CAMINO' && ['ENTREGADO', 'CANCELADO'].includes(cambios.estado)) {
        await repartidorServicio.cambiarDisponibilidad(repartidorActual, true);
      }

      await Pedido.findByIdAndUpdate(id, cambios, { runValidators: true });
      return poblar(Pedido.findById(id));
    },

        async eliminar(id) {
      const pedido = await buscar(id);
      if (pedido.estado === 'EN_CAMINO' || pedido.estado === 'ENTREGADO') {
        throw new ErrorConflicto(`No se puede eliminar un pedido ${pedido.estado}. Cancélalo si aún va en camino`);
      }
      await Pedido.findByIdAndDelete(id);
    },
    async guardarImagen(id, imagen) {
      await buscar(id);
      await Pedido.findByIdAndUpdate(id, { imagenDatos: imagen.datos, imagenTipo: imagen.tipo });
      return poblar(Pedido.findById(id));
    },
    async obtenerImagen(id) {
      await buscar(id);
      const registro = await Pedido.findById(id).select('+imagenDatos');
      if (!registro.imagenDatos) throw new ErrorNoEncontrado('El pedido no tiene imagen');
      return { datos: registro.imagenDatos, tipo: registro.imagenTipo };
    },
  };
}