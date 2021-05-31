const express = require('express');
const app = express();
require('dotenv').config();
const http = require('http').createServer(app)
const mongoose = require('mongoose');
const { database } = require('./config/database');
const passport = require('passport');
require('./passport');
const ejs = require('ejs');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser=require('cookie-parser');
const cookieSession = require('cookie-session');
const User = require('./models/user');
const cors=require('cors');
const path = require('path');
global.__basedir = __dirname+'/';
const favicon = require('serve-favicon');
const staticPath=path.join(__dirname,'/public');

app.use(cors());
app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.static(staticPath));

const port=process.env.PORT|| 3000;
global.listen=app.listen(port, () => {
    console.log("server started at port ");
})



app.use(cookieSession({keys: ['secret'],name:"sid"}));

//app.set('server',server);
app.get('/', (req, res) => {
   
    res.render('index');
})

// adding routes 
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userDomainRoutes = require('./routes/userDomain');
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/userDomain',userDomainRoutes);


mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("database connected");
        
        
    }).catch(err => {
        console.err(err);
    })

