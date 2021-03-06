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

//socket
const io = require('socket.io')(http);


app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
// app.use(session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true,
    
// }));
app.set('socketio',io);
io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

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



mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("database connected");
        http.listen(3000, () => {
            console.log(`server started at port ${3000}`);
        })
    }).catch(err => {
        console.err(err);
    })

