const express = require('express');
const cookieSession = require('cookie-session');
var helmet = require('helmet')
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const adminRoutes = require('./routes/admin-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
var cvController = require("./controllers/cvController");

var bodyParser = require('body-parser');


const app = express();

//helmet middleware to protect express headers
app.use(helmet());

// set view engine
app.set('view engine', 'ejs');
app.use('/static',express.static('static'));

//Allow CORS during development
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(
    keys.mongodb.dbURI,
    {
      useMongoClient: true
    }
);
mongoose.Promise = global.Promise;

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

cvController(app);

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
