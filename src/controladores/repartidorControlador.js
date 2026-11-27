import { repartidorDesdeEntrada, repartidorSalida, idDesdeEntrada } from '../dtos/repartidorDto.js';
import { imagenDesdeEntrada } from '../dtos/imagenDto.js';

export function crearRepartidorControlador(servicio) {
  return {
    listar: async (req, res) => res.json((await servicio.listar()).map(repartidorSalida)),
    obtener: async (req, res) => res.json(repartidorSalida(await servicio.obtener(idDesdeEntrada(req.params.id)))),
    crear: async (req, res) => {
      const creado = await servicio.crear(repartidorDesdeEntrada(req.body));
      res.status(201).json(repartidorSalida(creado));
    },
    actualizar: async (req, res) => {
      const actualizado = await servicio.actualizar(idDesdeEntrada(req.params.id), repartidorDesdeEntrada(req.body));
      res.json(repartidorSalida(actualizado));
    },
    eliminar: async (req, res) => {
      await servicio.eliminar(idDesdeEntrada(req.params.id));
      res.status(204).end();
    },
    subirImagen: async (req, res) => {
      const actualizado = await servicio.guardarImagen(idDesdeEntrada(req.params.id), imagenDesdeEntrada(req.file));
      res.json(repartidorSalida(actualizado));
    },
    verImagen: async (req, res) => {
      const imagen = await servicio.obtenerImagen(idDesdeEntrada(req.params.id));
      res.type(imagen.tipo).send(imagen.datos);
    },
  };
}