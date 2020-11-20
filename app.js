//jshint esversion:6
const express= require("express");
const ejs=require("ejs");
const app=express();
const clientID="ea870420606678b49849";
const clientSecret="80b21123dec51d57d458e044235c68ea659e636e";
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
var store=new MongoDBStore( require("./config/database"));
const bodyParser = require('body-parser')
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var passport = require('passport');
const User = require("./models/user");
const mongoose=require("mongoose");

passport.serializeUser(function(user, done) {
  //console.log(user.username);
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  User.findById(id,function(err,user){
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
    // represent the logged-in user.  In a typical application, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
    //console.log(User);
    User.findOne({username:profile.username},function(err,foundUser){
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




app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/collab", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(partials());
app.use(methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ secret: 'secret' ,resave:false,saveUninitialized:false,name:"sid"}));

app.get("/",function(req,res){
    //onst {userID}=req.session;
    //console.log( req.session);
    res.render('index',{client_id: clientID});
});

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

app.get('/signin', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  });

app.get('/dashboard',ensureAuthenticated, function(req, res) {


    User.findOne({userName:req.session.passport.user},function(err,foundUser){
      if(foundUser)
      {
        res.render("dashboard",{username:foundUser.userName});
      }
    });
    //res.render('dashboard');
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
  }
app.listen(3000,function(){
    console.log("server started");
});