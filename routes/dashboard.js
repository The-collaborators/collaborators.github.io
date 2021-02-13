const router = require('express').Router();
const multer=require('multer');
const path=require('path');
const nodemailer = require('nodemailer');
//used for multer
var storage=multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null,file.filename+"_"+Date.now()+path.extname(file.originalname));
    }
});

var storage1=multer.diskStorage({
    destination:"./public/uploadFile/",
    filename:(req,file,cb)=>{
        cb(null,file.filename+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload=multer({
    storage:storage
});



// var upload1=multer({
//     storage:storage1
// }).single("myFile");


router.get('/',ensureAuthenticated, (req,res) => {
    res.render('dashboard', {username: req.session.username, img_name: req.session.image, img_error: ''});
})

router.post('/',[upload.single("file")],(req,res)=>{
    //console.log(req.session.username)
    let img=req.file;
    //console.log("hello "+img );
    var flag =0;
    if(img!=undefined)
    {
      img=req.file.filename;
      flag=1;
    }
    if(req.body.upload==="Upload" && flag===1) 
    {
        req.session.image=img;
        User.findOne({username:req.session.username},function(err,found){
            if(found)
            {
                found.image=req.session.image;
                found.save(function(err){
                    if(err)
                    {
                        throw err;
                    }
                })
            }
        })

    }
    res.render("dashboard",{username:req.session.username,img_name:req.session.image,img_error:""});

})
router.get('/mail',[ensureAuthenticated],function(req,res,next){
    res.render('mail',{username:req.session.username});
})

router.post('/mail',[ensureAuthenticated,upload.array("file",5)], function(req,res,next){
    
    console.log(req.files);

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL , // TODO: your gmail account 
            pass:  process.env.PASSWORD // TODO: your gmail password
        }
    });
    
    // Step 2
    var fs=[];
    for (var i=0;i<req.files.length;i++)
    {
        fs.push({filename:req.files[i].filename,path:"./public/uploads/"+req.files[i].filename});
    }
    console.log(fs);
    let mailOptions = {
        from: 'aksjain891999@gmail.com', // TODO: email sender
        to: 'palviaanoushka@gmail.com', // TODO: email receiver
        subject: 'Nodemailer - Test',
        text: 'Wooohooo it works!!',
        attachments:  fs
            // { filename: 'uploads/profile.JPG', path: './images/profile.JPG' },
            // { filename: 'images/coder girl.JPG', path: './images/coder girl.JPG' } // TODO: replace it with your own image
        
    };
    
    // Step 3
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err);
            //return log('Error occurs');
        }
        console.log('Email sent!!!');
    });
    //res.render("dashboard",{username:req.session.username,img_name:req.session.image,img_error:""});
    res.render('mail',{username:req.session.username});
})
router.get('/logout', function(req, res, next) {
    // if (req.session) {
    //   // delete session object
    //   req.session.destroy(function(err) {
    //     if(err) {
    //       return next(err);
    //     } else {
    //         res.clearCookie("sid");
    //         return res.render('index');
    //     }
    //   });
    req.logout();

    // destroy session data
    req.session = null;
  
    // redirect to homepage
    //res.redirect('/');
    res.render('index');
  });

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
