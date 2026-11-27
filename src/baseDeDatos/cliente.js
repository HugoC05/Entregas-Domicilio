import mongoose from 'mongoose';

const esquema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, unique: true },
  telefono: { type: String, required: true, trim: true, maxlength: 10, unique: true },
  direccion: { type: String, required: true, trim: true, maxlength: 200 },
  imagenDatos: { type: Buffer, select: false },
  imagenTipo: { type: String },
}, { timestamps: true });

export const Cliente = mongoose.model('Cliente', esquema, 'clientes');