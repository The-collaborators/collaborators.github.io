const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const { database } = require('./config/database');
const passport = require('passport');
require('./passport');
const ejs = require('ejs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({uri: database});


const app = express();
app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    name: "sid", store: store, 
    cookie: { maxAge: 1000 }
}));

app.get('/', (req, res) => {
    console.log(req.sessionID);
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
        app.listen(3000, () => {
            console.log(`server started at port ${3000}`);
        })
    }).catch(err => {
        console.err(err);
    })