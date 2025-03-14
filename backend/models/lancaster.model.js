const mongoose = require('mongoose');

const LancasterSchema = new mongoose.Schema({
  coa: { type: String, unique: true, required: true },
  coa_new: { type: String },
  dsc: { type: String },
  dsc_abr: { type: String },
  direccion: { type: String },
}, { 
  collection: "PruebasDeDatos" // Nombre de la colección
});

LancasterSchema.index({ RUC: 1 }); // Crea un índice en el campo "ruc"

// Crea el modelo correctamente
const Lancaster = mongoose.model('Lancaster', LancasterSchema);

// Exporta el modelo
module.exports = Lancaster;