//db model to store admin data
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Admin Schema
var AdminSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	firstname: {
		type: String
	},
	lastname:{
		type: String
	},
	gender:{
		type:String
	},
	dob:{
		type:String
	},
	phone:{
		type:String
	}
});

var Admin = module.exports = mongoose.model('Admin', AdminSchema);

module.exports.createAdmin = function(newAdmin, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newAdmin.password, salt, function(err, hash) {
	        newAdmin.password = hash;
	        newAdmin.save(callback);
	    });
	});
}

module.exports.getAdminByUsername = function(username, callback){
	var query = {username: username};
	Admin.findOne(query, callback);
}

module.exports.getAdminById = function(id, callback){
	Admin.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}