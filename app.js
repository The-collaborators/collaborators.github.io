//jshint esversion:6
const express= require("express");
const ejs=require("ejs");
const app=express();
const session      = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser')
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var passport = require('passport');
const mongoose=require("mongoose");
require('dotenv').config()

// requiring from different files
var store=new MongoDBStore( require("./config/database"));
//const User = require("./models/user");
const users=require("./routes/users");

//env variables
const clientID=process.env.CLIENT_ID;
const clientSecret=process.env.CLIENT_Secret;

//middleware
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/collab", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(session({ secret: 'secret' ,resave:false,saveUninitialized:false,name:"sid",
store: store,cookie: { maxAge: 1000 }}));
app.use("/",users);


app.listen(3000,function(){
    console.log("server started");
});