import PDFDocument from 'pdfkit';
import { ErrorNoEncontrado } from '../errores/errores.js';

const opcional = async (promesa) => {
  try {
    return await promesa;
  } catch (error) {
    if (error instanceof ErrorNoEncontrado) return null;
    throw error;
  }
};

function seccion(doc, titulo, lineas, imagen) {
  if (doc.y > 560) doc.addPage();
  doc.moveDown().fontSize(14).fillColor('#1f4e79').text(titulo);
  doc.fontSize(11).fillColor('black');
  for (const linea of lineas) doc.text(linea);
  doc.moveDown(0.5);
  if (doc.y > 600) doc.addPage();
  if (imagen) doc.image(imagen.datos, { fit: [160, 160] });
  else doc.fillColor('gray').text('Sin imagen').fillColor('black');
}

function armarPdf({ pedido, cliente, repartidor, imagenPedido, imagenCliente, imagenRepartidor }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const partes = [];
    doc.on('data', (parte) => partes.push(parte));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('black').text(`Reporte del pedido #${pedido._id}`);
    doc.fontSize(10).fillColor('gray').text(`Generado el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`);
    doc.fillColor('black');

    seccion(doc, 'Pedido', [
      `Descripción: ${pedido.descripcion}`,
      `Dirección de entrega: ${pedido.direccionEntrega}`,
      `Estado: ${pedido.estado}`,
    ], imagenPedido);

    seccion(doc, 'Cliente', [
      `Nombre: ${cliente.nombre}`,
      `Correo: ${cliente.correo}`,
      `Teléfono: ${cliente.telefono}`,
      `Dirección: ${cliente.direccion}`,
    ], imagenCliente);

    if (repartidor) {
      seccion(doc, 'Repartidor', [
        `Nombre: ${repartidor.nombre}`,
        `Correo: ${repartidor.correo}`,
        `Teléfono: ${repartidor.telefono}`,
        `Vehículo: ${repartidor.vehiculo}`,
      ], imagenRepartidor);
    } else {
      doc.moveDown().fontSize(14).fillColor('#1f4e79').text('Repartidor');
      doc.fontSize(11).fillColor('black').text('Todavía no tiene repartidor asignado.');
    }

    doc.end();
  });
}

export function crearReporteServicio({ pedidoServicio, clienteServicio, repartidorServicio }) {
  return {
    async pedidoPdf(id) {
      const pedido = await pedidoServicio.obtener(id);
      const cliente = await clienteServicio.obtener(pedido.clienteId._id);
      const repartidor = pedido.repartidorId ? await repartidorServicio.obtener(pedido.repartidorId._id) : null;
      const imagenPedido = await opcional(pedidoServicio.obtenerImagen(id));
      const imagenCliente = await opcional(clienteServicio.obtenerImagen(cliente._id));
      const imagenRepartidor = repartidor ? await opcional(repartidorServicio.obtenerImagen(repartidor._id)) : null;
      return armarPdf({ pedido, cliente, repartidor, imagenPedido, imagenCliente, imagenRepartidor });
    },
  };
}