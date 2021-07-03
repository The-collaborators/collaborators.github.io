const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const User = require('./models/user');
const https = require('http')
passport.use(new GithubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_Secret,
    callbackURL: 'https://the-collab.herokuapp.com/auth/github/callback',
    proxy:true,
    scope: [ 'user:email' ]

}, async(access_token, refreshToken, profile, done) => {
  //let username = profile.username

  try {
    let username = profile.username
      let user = await User.findOne({username: username});
      if(user){
        return done(null, user);
      }
      
      let nUser = await User.create({
          email: profile.emails[0].value,
          username: profile.username,
          domain: [],
          image: "default-image-png.png"
      });
      nUser.save();
      return done(null,nUser);

  } catch (error) {
      console.log(error);
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