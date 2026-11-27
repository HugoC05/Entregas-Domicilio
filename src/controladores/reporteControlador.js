import { idDesdeEntrada } from '../dtos/pedidoDto.js';

export function crearReporteControlador(servicio) {
  return {
    pedido: async (req, res) => {
      const id = idDesdeEntrada(req.params.id);
      const pdf = await servicio.pedidoPdf(id);
      res.type('application/pdf');
      res.set('Content-Disposition', `inline; filename="pedido-${id}.pdf"`);
      res.send(pdf);
    },
  };
}