const router = require('express').Router();
const bodyParser=require('body-parser');
const multer=require('multer');
const path=require('path');
const nodemailer = require('nodemailer');
const flash=require('connect-flash');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());
router.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});
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
    //res.send(req.flash('message'));
    
    console.log("hello "+res.locals.message);
    res.render('dashboard', {username: req.session.username, img_name: req.session.image});
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
    res.render("dashboard",{username:req.session.username,img_name:req.session.image});

})
router.get('/mail',[ensureAuthenticated],function(req,res,next){
    res.render('mail',{username:req.session.username});
})

router.post('/mail',[ensureAuthenticated,upload.array("file",5)], function(req,res,next){
    
    //console.log(req.files);
    //console.log(req.body.Javascript);
    var mailList=[];
    const arr = [];
    console.log("hello "+JSON.parse(req.body.net));
    if(req.body.Javascript!=undefined)
    {
        arr.push("JavaScript");
        console.log("1");
    }
    if(req.body.HTML!=undefined)
    {
        arr.push("HTML");
    }
    if(req.body.CSS!=undefined)
    {
        arr.push("CSS");
        console.log("1");
    }
    if((req.body.C)!=undefined)
    {
        arr.push("C++");
        //console.log("1 "+req.body.C++);
    }
    if(req.body.Python!=undefined)
    {
        arr.push("Python");
    }
    console.log(arr+"hi");
    // const checker = value =>
    // arr.some(element => value.includes(element));

    // User.find({},function(err,found){
    //     if(found.domain.filter(checker)!=undefined)
    //     {
    //         mailList.push(found.email);
    //     }
    // })
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL , // TODO: your gmail account 
            pass:  process.env.PASSWORD // TODO: your gmail password
        }
    });
    
    // Step 2
    var fs=[];
    if(req.files!=undefined)
    {
        for (var i=0;i<req.files.length;i++)
        {
            fs.push({filename:req.files[i].filename,path:"./public/uploads/"+req.files[i].filename});
        }
    }
    //console.log(fs);
    let mailOptions = {
        from: 'palviaanoushka@gmail.com', // TODO: email sender
        to: 'preetipalvia@gmail.com', // TODO: email receiver
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

router.get("/search",function(req,res,next){
    
    var x=req.query["term"];
    var regex=new RegExp("^"+x);
    //console.log(x);
    //x="/^"+x+"/";
    //console.log("hi" +regex);
    //console.log(User);
    if(x!=undefined)
    {
        //console.log("hi" +regex);
        var userFilter=User.find({username: { $regex: regex, $options: 'i' }}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
        //console.log(userFilter);
        userFilter.exec(function(err,data){
            //console.log("hi "+data);
            var result=[];
            
            if(!err){
                if(data && data.length && data.length>0)
                {
                    data.forEach(foundUser => {
                        let obj={
                            id:foundUser._id,
                            label:foundUser.username
                        };
                        //console.log(foundUser.username);
                        result.push(obj);
                    });
                    
                }
                res.jsonp(result);
                
            }
            else{
                console.log(err);
            }
        });
    }
})

router.post('/search',function(req,res,next){
    var name=req.body.filtername;
    console.log("name"+ name);
    if(name===req.session.username)
    {
        res.render("dashboard",{username:req.session.username,img_name:req.session.image});
    }
    else
    {
        User.findOne({username:name},function(err,found){
            if(found)
            {
                res.render("searchUserDashboard",{username:found.username,img_name:found.image,error:req.session.error});
            }
            else{
                req.flash('message', 'user not found'); 
                //console.log(found);
                //req.session.error="user not found ";
                //import {alert} from 'node-popup';
                //alert('Hello World!');
                //res.redirect({username:req.session.username,img_name:req.session.image,error:"user doesn't exists"},"/dashboard");
                //res.render("dashboard",{username:req.session.username,img_name:req.session.image,error:"user doesn't exists"});
                res.redirect("/dashboard");
            }
        })
    }
});

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
