//db model to store registered users list
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userListSchema = new Schema({
    user: String
});

const UserList = mongoose.model('UserList', userListSchema);

module.exports = UserList;
