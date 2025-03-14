const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        unique: true
    },
    activo: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
