//db model to store messages
const mongoose = require('mongoose');

const messageSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const Messages=mongoose.model('Messages',messageSchema);

module.exports = Messages;