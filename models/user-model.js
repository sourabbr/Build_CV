//db model to store user data
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    username: String,
    googleId: String,
    thumbnail: String,
    status: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
