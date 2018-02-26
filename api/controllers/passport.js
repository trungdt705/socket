var passport = require("passport");
var mongoose=require('mongoose');
var passportJWT = require("passport-jwt");
var modelUser = require("../models/modelUser");
var config = require('../../config/configApp.js');
var ExtractJwt=passportJWT.ExtractJwt;
var JwtStrategy=passportJWT.Strategy;

var options={};
options.jwtFromRequest=ExtractJwt.fromAuthHeaderWithScheme('JWT');
options.secretOrKey=config.secretToken;

var strategy=new JwtStrategy(options,  function(payload, done){
  modelUser.findOne({userId: payload.userId}, function (err, user) {
    if(err) throw err;
    if(user)  return done(null, user);
    else{
      return done(null, false);
    }
  })
})

var FacebookStrategy=require('passport-facebook').Strategy;

var fbStrategy= new FacebookStrategy({
    clientID:'1419251764853470',
    clientSecret:'4f110b1ddacb4498f54e631b89d08598',
    callbackURL:'http://localhost:8080/auth/facebook/callback',
    profileFields:['email', 'name', 'gender', 'displayName', 'profileUrl', 'photos','birthday']
}, function (accessToken, refreshToken, profile, done) {
  modelUser.findOne({userId:profile.id}, function (err, user) {
    if(err) return done(err);
    if(user) return done(null, user)
      else{
        var date= new Date(profile._json.birthday);
        var birthday= date.getTime();
        modelUser.create({'userId':profile.id,
                          'username':profile._json.name,
                          'tokenFb': accessToken,
                          'gender':profile._json.gender,
                          'email':profile._json.email,
                          'thumbnail':profile.photos[0].value,
                          'birthday':birthday,
                          'role':1,
                          'createdAt':Date.now(),
                          'updatedAt':Date.now(),
                          'status':'1'}, function (err, user) {
          if(err) throw err;
          if(user){
            return done(null, user); 
          } 
        })
      }
    })
})

module.exports={
  strategy:strategy,
  fbStrategy:fbStrategy
}