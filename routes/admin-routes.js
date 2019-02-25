var express = require('express');
var router = express.Router();
var session = require('express-session');

const User = require('../models/user-model');
const UserList = require('../models/userlist-model');
const Admin = require('../models/admin-model');
const Message = require('../models/message-model');

//admin session
router.use(session({secret: "adminaccesssession", resave: false, saveUninitialized: true}));

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('adminLogin');
});

// Register Admin
router.post('/register', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var dob = req.body.dob;
	var gender = req.body.gender;
	var phone = req.body.phone;
	var token = req.body.token;
	var newAdmin = new Admin({
		firstname: firstname,
		lastname: lastname,
		email:email,
		username: username,
		password: password,
		dob: dob,
		gender: gender,
		phone: phone
	});
	if(token == "thesecrettoken"){
		Admin.createAdmin(newAdmin, function(err, user){
			if(err) throw err;
			console.log(user);
		});
	}
	res.redirect('/admin/login');
});

//post request for admin login
router.post('/login', function(req, res) {
	loginAuth(req.body.username, req.body.password,req,res);
});

//get request to render admin profile page
router.get('/adminProfile', function(req, res){
	if(req.session.admin){
		res.render('adminProfile');
	}
	else{
		res.redirect('/admin/login');
	}
});

//get request to render admin control page
router.get('/adminControl', function(req, res){
	if(req.session.admin){
		res.render('adminControl');
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to get all users
router.post('/allusers', function(req, res){
	if(req.session.admin){
		User.find({status: "active"},{'_id':0,'__v':0}, function (err, users) {
			if (err) return res.status(500).send({ error: err });
			res.json(users);
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to get all registered users
router.post('/registeredusers', function(req, res){
	if(req.session.admin){
		UserList.find({},{'_id':0,'__v':0}, function (err, users) {
			if (err) return res.status(500).send({ error: err });
			res.json(users);
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to get all active users
router.post('/allactiveusers', function(req, res){
	if(req.session.admin){
		User.find({status: "active"},{'_id':0,'__v':0}, function (err, users) {
			if (err) return res.status(500).send({ error: err });
			res.json(users);
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to get blocked users
router.post('/allblockedusers', function(req, res){
	if(req.session.admin){
		User.find({status: "inactive"},{'_id':0,'__v':0}, function (err, users) {
			if (err) return res.status(500).send({ error: err });
			res.json(users);
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to block users
router.post('/blockusers', function(req, res){
	if(req.session.admin){
		User.updateMany({'email':req.body.blocklist},{$set:{'status':'inactive'}}).then(user=>{
			res.json(user)
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to activate users
router.post('/activateusers', function(req, res){
	if(req.session.admin){
		User.updateMany({'email':req.body.activatelist},{$set:{'status':'active'}}).then(user=>{
			res.json(user)
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to send message to user
router.post('/message', function(req, res){
	if(req.session.admin){
		req.body.message.time = new Date(Date.now()).toLocaleString();
		Message.findOne({email: req.body.email},{'_id':0,'__v':0}, function (err, msgs) {
			if (err) return res.status(500).send({ error: err });
			if(msgs){
				var msg=JSON.stringify(msgs);
				msg=JSON.parse(msg);
				msg.msgs.push(req.body.message);
				Message.updateOne({email: req.body.email}, msg,{upsert:true}, function(err, data){
                    if (err) return res.status(500).send({ error: err });
                    return res.send("succesfully updated");
                });
			}else{
				var nmsg={email:req.body.email,msgs:[req.body.message]};
				new Message(nmsg
				).save().then((newMsg) => {
					return res.send("succesfully inserted");
				});
			}
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//post request to add user to use this platform
router.post('/adduser', function(req, res){
	if(req.session.admin){
		UserList.findOne({user: req.body.user},{'_id':0,'__v':0}, function (err, user) {
			if (err) return res.status(500).send({ error: err });
			if(user){
				res.json(user);
			}else{
				new UserList({
					user: req.body.user
				}).save().then((newUser) => {
					res.json(newUser)
				});
			}
		});
	}
	else{
		res.redirect('/admin/login');
	}
});

//get request for admin logout
router.get('/logout', function(req, res){
	req.session.admin = null;
	res.redirect('/admin/login');
});

//function for admin auth check
function loginAuth(username, password, req, res) {
	Admin.getAdminByUsername(username, function(err, user){
		if(err) throw err;
		if(!user){
			res.redirect('/admin/login');
		}
		else{
			Admin.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					req.session.admin = user;
					res.redirect('/admin/adminProfile');
				} else {
					res.redirect('/admin/login');
				}
			});
		}
	});
}

// function ensureAuthenticated(req, res, next){
// 	console.log(req.isAuthenticated());
// 	if(req.isAuthenticated()){
// 		return next();
// 	} else {
// 		res.redirect('/admin/login');
// 	}
// }

module.exports = router;