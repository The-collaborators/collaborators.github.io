const router = require('express').Router();
const bodyParser=require('body-parser');
const multer=require('multer');
const path=require('path');
const nodemailer = require('nodemailer');
const flash=require('connect-flash');
//const http = require('http').createServer(router)
//const io = require('socket.io')(http);
const chatDetail = require("../models/chatDetail");
const chat = require("../models/chats");




router.use(flash());
router.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});
//router.use(cors(corsOptions));
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
    
    var ans=JSON.stringify(req.body);
    ans=JSON.parse(ans);
    // console.log(req.body,"body");
    var arr=[];
    for(var myKey in ans) {
        if(ans[myKey]==="JavaScript")
        {
            arr.push("JavaScript");
        }
        else if(ans[myKey]==="HTML")
        {
            arr.push("HTML");
        }
        else if(ans[myKey]==="CSS")
        {
            arr.push("CSS");
        }
        else if(ans[myKey]==="C++")
        {
            arr.push("C++");
        }
        else{
            arr.push("Python");
        }
     }
     console.log(arr,"domain");

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
    var mailList=[];
    User.find({},function(err,found){
        for(var i=0;i<found.length;i++)
        {
            if(found[i].domain.some(item => arr.includes(item))===true)
            {
                //console.log(found[i].email,"mail");
                mailList.push(found[i].email);
                console.log(mailList,"mail1");
            }
            //console.log(found[i]["domain"],found[i]["username"]);
        }
        console.log(mailList,"mail");
        mailList.push("18bcs2152@cuchd.in");
        let mailOptions = {
            from: 'palviaanoushka@gmail.com', // TODO: email sender
            to: mailList, // TODO: email receiver
            subject: 'Nodemailer - Test',
            text: 'Wooohooo it works!!',
            attachments:  fs
            // { filename: 'uploads/profile.JPG', path: './images/profile.JPG' },
            // { filename: 'images/coder girl.JPG', path: './images/coder girl.JPG' } // TODO: replace it with your own image
        
        };
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                console.log(err);
                //return log('Error occurs');
            }
            console.log('Email sent!!!');
        });
    });
    res.render('mail',{username:req.session.username});
})

router.get("/search",function(req,res,next){
    
    var x=req.query["term"];
    var regex=new RegExp("^"+x);
    if(x!=undefined)
    {
        
        var userFilter=User.find({username: { $regex: regex, $options: 'i' }}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
        
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
                res.render("searchUserDashboard",{username:found.username,img_name:found.image,searchUserID:found._id});
            }
            else{
                req.flash('message', 'user not found'); 
                res.redirect("/dashboard");
            }
        })
    }
});

router.get("/search/chat/:searchUserID",function(req,res,next){
        
        const io = req.io;
        let min,max,searchUser;
        User.findById(req.params.searchUserID,function(err,found){
            searchUser=found.username;
        })
        //console.log("userID",req.params.searchUserID);
        if(req.params.searchUserID>req.session.userID)
        {
            min=req.session.userID;
            max=req.params.searchUserID;
        }
        else{
            max=req.session.userID;
            min=req.params.searchUserID;
        }
        //console.log("io",io);
        io.on('connection', (socket) => {
    
            console.log('a user connected');
            //console.log("hi",typeof(msg));
            socket.on("input",msg=>{
                msg.from=req.session.userID;
                let nChatDetail=new chatDetail({
                    from:req.session.userID,
                    talk:msg.talk
                })
                
                let nChat = new chat({
                    user1:min,
                    user2:max,
                    conversation:nChatDetail
                });
                nChat.save();
                nChatDetail.save();
                console.log(typeof(msg));
            });
            let chatArr=[];
            chat.find({user1:min,user2:max},function(err,found){
                for(let i=0;i<found.length;i++)
                {
                    chatDetail.findById(found[i].conversation,function(err,foundUser){
                        //console.log("found",foundUser);
                        if(foundUser!=null)
                        {
                            chatArr.push(foundUser);
                        }
                        
                        
                    })
                }
                console.log("chat",chatArr);
                socket.emit("output",(chatArr,req.session.userID,req.params.searchUserID));
            })
            socket.on('disconnect', () => {
              console.log('user disconnected');
            });
        });

        

    
    
    res.render('chat',{searchUser:searchUser,user:req.session.username});
})

router.get('/logout', function(req, res, next) {

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
