//db model for storing change logs
const mongoose = require('mongoose');

const changeslogSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const ChangesLog=mongoose.model('ChangesLog',changeslogSchema);

module.exports = ChangesLog;