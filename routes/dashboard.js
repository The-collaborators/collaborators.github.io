const router = require('express').Router();
const multer=require('multer');
const path=require('path')
//used for multer
var storage=multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null,file.filename+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload=multer({
    storage:storage
}).single("file");

router.get('/', (req,res) => {
    //console.log(req.session);
    res.render('dashboard', {username: req.session.username, img_name: req.session.image, img_error: ''});
})

router.post('/',[upload],(req,res)=>{
    console.log("hello");
    //req.session.username=req.body.username;
    console.log(req.session.username);
    let img=req.file;
    var flag =0;
    if(img!=undefined)
    {
      img=req.file.filename;
      flag=1;
    }
    if(req.body.upload==="Upload" && flag===1) 
    {
        req.session.image=img;
        // foundUser.save(function(err){
        //     if(err)
        //     {
        //         throw err;
        //     }
        // });

    }
    res.render("dashboard",{username:req.session.username,img_name:req.session.image,img_error:""});
    // User.findOne({userName:req.session.passport.user},function(err,foundUser){
    //   console.log(foundUser);
    //   if(foundUser)
    //   {
    //     //console.log("hello");
    //     //foundUser.image=req.body.filepond;
    //     //console.log(foundUser.image);
    //     if(req.body.upload==="Upload" && flag===1) 
    //     {
    //       foundUser.image=img;
    //       foundUser.save(function(err){
    //         if(err)
    //         {
    //             throw err;
    //         }
    //       });
    //     }
    //     res.render("dashboard",{username:foundUser.userName,img_name:foundUser.image,img_error:""});
    //   }
    // });
})
function ensureAuthenticated(req, res, next) {
    if(req.session.login===true)
   {
       console.log(req.session.username);
       return next();
   }
   else{
       res.redirect('/');
   }
    
}

module.exports = router;
