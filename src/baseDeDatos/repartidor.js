import mongoose from 'mongoose';

const esquema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, unique: true },
  telefono: { type: String, required: true, trim: true, maxlength: 10 },
  vehiculo: { type: String, required: true, trim: true, maxlength: 50 },
  disponible: { type: Boolean, default: true },
  imagenDatos: { type: Buffer, select: false },
  imagenTipo: { type: String },
}, { timestamps: true });

export const Repartidor = mongoose.model('Repartidor', esquema, 'repartidores');