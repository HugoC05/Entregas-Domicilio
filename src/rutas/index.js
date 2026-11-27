import express from 'express';
import multer from 'multer';
import { conectarBaseDeDatos } from '../baseDeDatos/conexion.js';
import { Cliente } from '../baseDeDatos/cliente.js';
import { Repartidor } from '../baseDeDatos/repartidor.js';
import { Pedido } from '../baseDeDatos/pedido.js';
import { crearClienteServicio } from '../servicios/clienteServicio.js';
import { crearRepartidorServicio } from '../servicios/repartidorServicio.js';
import { crearPedidoServicio } from '../servicios/pedidoServicio.js';
import { crearReporteServicio } from '../servicios/reporteServicio.js';
import { crearClienteControlador } from '../controladores/clienteControlador.js';
import { crearRepartidorControlador } from '../controladores/repartidorControlador.js';
import { crearPedidoControlador } from '../controladores/pedidoControlador.js';
import { crearReporteControlador } from '../controladores/reporteControlador.js';
import { manejadorErrores, rutaNoEncontrada } from '../errores/manejadorErrores.js';

const clienteServicio = crearClienteServicio({ Cliente, Pedido });
const repartidorServicio = crearRepartidorServicio({ Repartidor, Pedido });
const pedidoServicio = crearPedidoServicio({ Pedido }, clienteServicio, repartidorServicio);
const reporteServicio = crearReporteServicio({ pedidoServicio, clienteServicio, repartidorServicio });

const clienteControlador = crearClienteControlador(clienteServicio);
const repartidorControlador = crearRepartidorControlador(repartidorServicio);
const pedidoControlador = crearPedidoControlador(pedidoServicio);
const reporteControlador = crearReporteControlador(reporteServicio);

const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

function rutasCrud(controlador) {
  const r = express.Router();
  r.get('/', controlador.listar);
  r.get('/:id', controlador.obtener);
  r.post('/', controlador.crear);
  r.put('/:id', controlador.actualizar);
  r.delete('/:id', controlador.eliminar);
  r.put('/:id/imagen', subida.single('imagen'), controlador.subirImagen);
  r.get('/:id/imagen', controlador.verImagen);
  return r;
}

const app = express();
app.use(express.json());
app.get('/api/pedidos/:id/reporte', reporteControlador.pedido);
app.use('/api/clientes', rutasCrud(clienteControlador));
app.use('/api/repartidores', rutasCrud(repartidorControlador));
app.use('/api/pedidos', rutasCrud(pedidoControlador));
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

try {
  await conectarBaseDeDatos();
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message);
  process.exit(1);
}

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => console.log(`Servidor listo en http://localhost:${puerto}`));