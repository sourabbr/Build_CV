const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, email, done) => {
        // check if user already exists in our own db
        User.findOne({email: email.emails[0].value}).then((currentUser) => {
            if(currentUser){
                // already have this user
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    email: email.emails[0].value,
                    googleId: email.id,
                    username: email.displayName,
                    thumbnail: email.photos[0].value,
                    status: "active"
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });
                
    })
);

