const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const User = require('./models/user');

passport.use(new GithubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_Secret,
    callbackURL: 'http://localhost:3000/auth/github/callback'

}, (access_token, refreshToken, profile, done) => {
    process.nextTick(() => {
        User.findOne({username: profile.username}, (err, foundUser) => {
            if(err){
                return (err, null);
            }
            if(foundUser != null){
                return done(null, foundUser);
            }
            let newUser = new User({
                email: null,
                username: profile.username,
                domain: null,
                image: "default-image-png.png"
            });
            newUser.save();

            return done(null, newUser);
        })
    })
}));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    User.findOne({userName: user}, (err, user) => {
        done(null, user);
    })
})