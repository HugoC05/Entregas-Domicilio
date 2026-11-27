import mongoose from 'mongoose';

const esquema = new mongoose.Schema({
  _id: { type: String },
  valor: { type: Number, default: 0 },
});

export const Contador = mongoose.model('Contador', esquema, 'contadores');

export async function siguienteId(nombre) {
  const contador = await Contador.findByIdAndUpdate(
    nombre,
    { $inc: { valor: 1 } },
    { upsert: true, returnDocument: 'after' },
  ).lean();
  return contador.valor;
}