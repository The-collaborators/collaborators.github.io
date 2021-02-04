const router = require('express').Router();

router.get("/",function(req,res){
    //onst {userID}=req.session;
    //console.log( req.session);
    res.render('index');
});