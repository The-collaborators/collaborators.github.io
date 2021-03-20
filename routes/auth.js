const router = require('express').Router();
const passport = require('passport');

router.get('/github', passport.authenticate('github', {scope: ['user:email']}));

router.get('/github/callback', passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    // console.log("hi");
    // console.log(req.user.userame);
    req.session.username = req.user.username;
    req.session.image = req.user.image;
    req.session.login=true;
    req.session.userID=req.user._id;
    res.redirect('/dashboard');
})


module.exports = router;
