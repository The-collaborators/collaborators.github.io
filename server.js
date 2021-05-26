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

//socket


app.use(cors());
app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());

global.listen=app.listen(3000, () => {
    console.log("server started at port ");
})



app.use(cookieSession({keys: ['secret'],name:"sid"}));

//app.set('server',server);
app.get('/', (req, res) => {
    // console.log(req.sessionID);
    res.render('index');
})

// adding routes 
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

app.get("/download/:file",(req,res)=>{
    const f2=`C:\\Users\\03ano\\collab\\collaborators.github.io\\public\\uploads\\${req.params.file}`
    res.download(f2);
})

mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("database connected");
        // const io = require('./socket').init(listen);
        // io.on('connection', (socket) => {
        //     console.log('a user connected');
            
        // })
        
    }).catch(err => {
        console.err(err);
    })

