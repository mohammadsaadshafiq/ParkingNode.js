require('dotenv').config();
var passport = require('passport');
var LocalStrategy = require('passport-local');
const facebookStrat =require('passport-facebook').Strategy
const User = require('../models/user.model').getUserModel;
var crypto = require('crypto');

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    },
        function (email, password, done) {           
            User.findOne({ $or: [{ EmailID: username }, { MobileNumber: username }] }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                encryptPassword(password, user.Salt, (err, pwdGen) => {
                    if (err) {
                        return done(err);
                    }
                    if (user.password === pwdGen) {
                        return done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            })

        }
    ))
        //make out facebook stratergy
        passport.use(new facebookStrat({
            clientID: process.env.clientID,
            clientSecret:process.env.clientSecret,
            callbackURL:process.env.callbackURL,
            profileFields: ["id","displayName","email","name","gender","picture.type(large)"],
            },
            function(accessToken,refreshToken,profile,done){
                process.nextTick(function(req, res){
                    // var localStorage = require('localStorage')
                    // localStorage.setItem('accessToken', accessToken);
                    console.log("token",accessToken)
                    User.findOne({'EmailID':profile.emails[0].value},function(err, user){
                        if (err){
                            return done(err);
                        }
                        if (user) {
                            return done(null, user);
                        }else {
                            var newUser = new User();                       
                            newUser.FirstName  = profile.name.givenName;
                            newUser.LastName = profile.name.familyName; 
                            //newUser.pic = profile.photos[0].value
                            newUser.EmailID = profile.emails[0].value;
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                })
            }));            
            passport.serializeUser(function (user, done) {
                done(null, user.id);
            });
        
            passport.deserializeUser(function (id, done) {
                User.findOne({ _id: id }, function (err, user) {
                    done(err, user);
                });
            });
};
function encryptPassword(password, Salt, callback) {
    if (!password || !Salt) {
        return callback("Missing password or Salt");
    }
    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var Salt = new Buffer.from(Salt, "base64");

    return crypto.pbkdf2(
        password,
        Salt,
        defaultIterations,
        defaultKeyLength,
        "sha1",
        (err, key) => {
            if (err) {
                callback(err);
            } else {
                callback(null, key.toString("base64"));
            }
        }
    );
}