import mongoose from 'mongoose';

const esquema = new mongoose.Schema({
  _id: { type: Number },
  clienteId: { type: Number, ref: 'Cliente', required: true },
  repartidorId: { type: Number, ref: 'Repartidor', default: null },
  descripcion: { type: String, required: true, trim: true, maxlength: 255 },
  direccionEntrega: { type: String, required: true },
  estado: { type: String, enum: ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'], default: 'PENDIENTE' },
  imagenDatos: { type: Buffer, select: false },
  imagenTipo: { type: String },
}, { timestamps: true });

export const Pedido = mongoose.model('Pedido', esquema, 'pedidos');