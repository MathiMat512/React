const mongoose = require('mongoose');

const ctapagarSchema = new mongoose.Schema({
    coa: { type: String, unique: true, required: true },
},{
    collection: "ctapagar"
});

ctapagarSchema.index({ COA: 1 });

const Ctapagar = mongoose.model('Ctapagar', ctapagarSchema);

module.exports = Ctapagar;