const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const User = require('./models/user');

passport.use(new GithubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_Secret,
    callbackURL: 'http://localhost:3000/auth/github/callback'

}, async(access_token, refreshToken, profile, done) => {
    let username = profile.username

    try {
        let user = await User.findOne({username: username});
        if(user){
            return done(null, user);
        }
        
        let nUser = await User.create({
            email: "03anoushkapalvia@gmail.com",
            username: profile.username,
            domain: ["CSS","C++"],
            image: "default-image-png.png"
        });
        nUser.save();
        return done(null,nUser);

    } catch (error) {
        done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    User.findOne({username: user.username}, (err, user) => {
        done(null, user);
    })
})