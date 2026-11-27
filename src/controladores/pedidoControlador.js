import { pedidoCrearDesdeEntrada, pedidoActualizarDesdeEntrada, pedidoSalida, idDesdeEntrada } from '../dtos/pedidoDto.js';
import { imagenDesdeEntrada } from '../dtos/imagenDto.js';

export function crearPedidoControlador(servicio) {
  return {
    listar: async (req, res) => res.json((await servicio.listar()).map(pedidoSalida)),
    obtener: async (req, res) => res.json(pedidoSalida(await servicio.obtener(idDesdeEntrada(req.params.id)))),
    crear: async (req, res) => {
      const creado = await servicio.crear(pedidoCrearDesdeEntrada(req.body));
      res.status(201).json(pedidoSalida(creado));
    },
    actualizar: async (req, res) => {
      const actualizado = await servicio.actualizar(idDesdeEntrada(req.params.id), pedidoActualizarDesdeEntrada(req.body));
      res.json(pedidoSalida(actualizado));
    },
    eliminar: async (req, res) => {
      await servicio.eliminar(idDesdeEntrada(req.params.id));
      res.status(204).end();
    },
    subirImagen: async (req, res) => {
      const actualizado = await servicio.guardarImagen(idDesdeEntrada(req.params.id), imagenDesdeEntrada(req.file));
      res.json(pedidoSalida(actualizado));
    },
    verImagen: async (req, res) => {
      const imagen = await servicio.obtenerImagen(idDesdeEntrada(req.params.id));
      res.type(imagen.tipo).send(imagen.datos);
    },
  };
}