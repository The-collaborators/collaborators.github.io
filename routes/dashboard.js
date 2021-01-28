const router = require('express').Router();


router.get('/', (req,res) => {
    console.log(req.session);
    res.render('dashboard', {username: req.session.username, img_name: req.session.image, img_error: ''});
})

module.exports = router;
