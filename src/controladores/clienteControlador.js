import { clienteDesdeEntrada, clienteSalida, idDesdeEntrada } from '../dtos/clienteDto.js';
import { imagenDesdeEntrada } from '../dtos/imagenDto.js';

export function crearClienteControlador(servicio) {
  return {
    listar: async (req, res) => res.json((await servicio.listar()).map(clienteSalida)),
    obtener: async (req, res) => res.json(clienteSalida(await servicio.obtener(idDesdeEntrada(req.params.id)))),
    crear: async (req, res) => {
      const creado = await servicio.crear(clienteDesdeEntrada(req.body));
      res.status(201).json(clienteSalida(creado));
    },
    actualizar: async (req, res) => {
      const actualizado = await servicio.actualizar(idDesdeEntrada(req.params.id), clienteDesdeEntrada(req.body));
      res.json(clienteSalida(actualizado));
    },
    eliminar: async (req, res) => {
      await servicio.eliminar(idDesdeEntrada(req.params.id));
      res.status(204).end();
    },
    subirImagen: async (req, res) => {
      const actualizado = await servicio.guardarImagen(idDesdeEntrada(req.params.id), imagenDesdeEntrada(req.file));
      res.json(clienteSalida(actualizado));
    },
    verImagen: async (req, res) => {
      const imagen = await servicio.obtenerImagen(idDesdeEntrada(req.params.id));
      res.type(imagen.tipo).send(imagen.datos);
    },
  };
}