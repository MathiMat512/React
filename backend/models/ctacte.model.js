const mongoose = require('mongoose');

const ctacteSchema = new mongoose.Schema({
  coa: { type: String, unique: true, required: true },
}, { 
  collection: "ctacte" // Nombre de la colección
});

ctacteSchema.index({ COA: 1 }); // Crea un índice en el campo "ruc"

// Crea el modelo correctamente
const Ctacte = mongoose.model('Ctacte', ctacteSchema);

// Exporta el modelo
module.exports = Ctacte;