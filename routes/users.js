const express= require("express");
const router = express.Router();
const ejs=require("ejs");
const session      = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var passport = require('passport');
const mongoose=require("mongoose");
require('dotenv').config()
//console.log(process.env);
// requiring from different files
const User = require("../models/user");


//env variables
const clientID=process.env.CLIENT_ID;
const clientSecret=process.env.CLIENT_Secret;

//passport used for github login authentication
passport.serializeUser(function(user, done) {
  //console.log(user.username);
  done(null, user.username);
});

passport.deserializeUser(function(user, done) {
  //console.log(user);
  User.findOne({userName:user},function(err,user){
    done(null, user);
  });
  
});

passport.use(new GitHubStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: "http://localhost:3000/signin"
},
function(access_token, refreshToken, profile, done) {

  // asynchronous verification, for effect...
  process.nextTick(function () {
    
    // To keep the example simple, the user's GitHub profile is returned to
    // represent the logged-in user.  In a typical routerlication, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
    //console.log(User);
    User.findOne({userName:profile.username},function(err,foundUser){
      if(foundUser!=null){
        //console.log(foundUser);
        //return done(err, foundUser);
      }
      else{
        let newUser = new User({
          email: null,
          userName: profile.username,
          domain: null
        });
        newUser.save();
        //console.log(newUser);
        //return done(err, newUser);
      }
    })
    return done(null, profile);
  });
}
));

//middleware
router.use(partials());
router.use(methodOverride());
router.use(passport.initialize());
router.use(passport.session());

router.get("/",function(req,res){
    //onst {userID}=req.session;
    //console.log( req.session);
    res.render('index');
});

router.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

router.get('/signin', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    //console.log(req.session.passport.user);
    res.redirect('/dashboard');
  });

router.get('/dashboard',ensureAuthenticated, function(req, res) {


    User.findOne({userName:req.session.passport.user},function(err,foundUser){
      if(foundUser)
      {
        res.render("dashboard",{username:foundUser.userName});
      }
    });
    
  });

  router.post("/dashboard",ensureAuthenticated, function(req,res){
    console.log("hi");
    console.log(req.body);
    User.findOne({userName:req.session.passport.user},function(err,foundUser){
      //console.log(foundUser);
      if(foundUser)
      {
        foundUser.image=req.body.filepond;
        //console.log(foundUser.image);
        res.render("dashboard",{username:foundUser.userName});
      }
    });
  })

   router.get('/logout', function(req, res){

    // req.session.destroy(function (err) {
    //   res.clearCookie('connect.sid');
    //   
    //   res.redirect('/'); 
    // });
    req.logout();
    req.session.destroy();
    //cookie.Expires = DateTime.Now.AddDays(-1);
    console.log(req.cookie);
    res.redirect('/');
  });
  


function ensureAuthenticated(req, res, next) {
    //console.log(req.session.passport.user);
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
    // if (req.session.passport.user) { return next(); }
    // res.redirect('/');
    
  }

  module.exports=router;