import { ErrorConflicto, ErrorNoEncontrado } from '../errores/errores.js';
import { siguienteId } from '../baseDeDatos/contador.js';

export function crearClienteServicio({ Cliente, Pedido }) {
  const obtener = async (id) => {
    const cliente = await Cliente.findById(id).lean();
    if (!cliente) throw new ErrorNoEncontrado(`No existe el cliente con id ${id}`);
    return cliente;
  };

  const validarUnico = async (datos, idPropio) => {
    const filtro = { $or: [{ correo: datos.correo }, { telefono: datos.telefono }] };
    if (idPropio) filtro._id = { $ne: idPropio };
    const repetido = await Cliente.findOne(filtro).lean();
    if (!repetido) return;
    const mismoCorreo = repetido.correo === datos.correo;
    const mismoTelefono = repetido.telefono === datos.telefono;
    if (mismoCorreo && mismoTelefono) throw new ErrorConflicto('Ya existe un cliente con ese correo y ese teléfono');
    if (mismoCorreo) throw new ErrorConflicto('Ya existe un cliente con ese correo');
    throw new ErrorConflicto('Ya existe un cliente con ese teléfono');
  };

  return {
    obtener,
    listar: () => Cliente.find().sort({ _id: 1 }).lean(),
    async crear(datos) {
      await validarUnico(datos);
      const cliente = await Cliente.create({ _id: await siguienteId('clientes'), ...datos });
      return cliente.toObject();
    },
    async actualizar(id, datos) {
      await obtener(id);
      await validarUnico(datos, id);
      return Cliente.findByIdAndUpdate(id, datos, { returnDocument: 'after', runValidators: true }).lean();
    },
    async eliminar(id) {
      await obtener(id);
      if (await Pedido.exists({ clienteId: id })) {
        throw new ErrorConflicto('No se puede eliminar: el cliente tiene pedidos registrados');
      }
      await Cliente.findByIdAndDelete(id);
    },
    async guardarImagen(id, imagen) {
      await obtener(id);
      await Cliente.findByIdAndUpdate(id, { imagenDatos: imagen.datos, imagenTipo: imagen.tipo });
      return obtener(id);
    },
    async obtenerImagen(id) {
      await obtener(id);
      const registro = await Cliente.findById(id).select('+imagenDatos');
      if (!registro.imagenDatos) throw new ErrorNoEncontrado('El cliente no tiene imagen');
      return { datos: registro.imagenDatos, tipo: registro.imagenTipo };
    },
  };
}