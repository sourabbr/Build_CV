//db model to store cv
const mongoose = require('mongoose');

const cvSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const Cv=mongoose.model('Cv',cvSchema);

module.exports = Cv;