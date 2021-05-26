const router = require("express").Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const flash = require("connect-flash");
const chatRoom=require("../models/room")
const io = require('socket.io')(listen);
const prj=require("../models/project");

//try
const rooms={};
let username;
var ans;

router.use(flash());
router.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});
//router.use(cors(corsOptions));
//used for multer
var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.filename + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var storage1 = multer.diskStorage({
  destination: "./public/uploadFile/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.filename + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
});

router.get("/", ensureAuthenticated, (req, res) => {

  username=req.session.username
  prj.findOne({username:username},function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      if(found===null)
      {
        res.render("dashboard", {
          username: req.session.username,
          img_name: req.session.image,
          domain: req.session.domain,
          project:[],
          id:[]
        });
      }
      else{
        res.render("dashboard", {
          username: req.session.username,
          img_name: req.session.image,
          domain: req.session.domain,
          project:found.project
        });
      }
      
    }
  })
  
});

router.post("/", [upload.single("file")], (req, res) => {
  //console.log(req.session.username)
  let img = req.file;
  //console.log("hello "+img );
  var flag = 0;
  if (img != undefined) {
    img = req.file.filename;
    flag = 1;
  }
  if (req.body.upload === "Upload" && flag === 1) {
    req.session.image = img;
    User.findOne({ username: req.session.username }, function (err, found) {
      if (found) {
        found.image = req.session.image;
        found.save(function (err) {
          if (err) {
            throw err;
          }
        });
      }
    });
  }
  prj.findOne({username:username},function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      if(found===null)
      {
        res.render("dashboard", {
          username: req.session.username,
          img_name: req.session.image,
          domain: req.session.domain,
          project:[]
        });
      }
      else{
        res.render("dashboard", {
          username: req.session.username,
          img_name: req.session.image,
          domain: req.session.domain,
          project:found.project
        });
      }
    }
  })
});

router.get("/domain", [ensureAuthenticated], function (req, res, next) {
    res.render("domain", { username: req.session.username });
});

router.post("/domain", [ensureAuthenticated], function (req, res, next){
    ans = JSON.stringify(req.body);
    ans = JSON.parse(ans);
    ans=ans.finalList;
    console.log(ans, " yeah");
});


router.get("/domain/mail", [ensureAuthenticated], function (req, res, next) {
  res.render("mail", { username: req.session.username });
});



router.post("/domain/mail",[ensureAuthenticated, upload.array("file", 5)],
  function (req, res, next) {


    var arr=[];
    console.log("domain",ans);
    for (var myKey in ans) {
      if (ans[myKey] === "JavaScript") {
        arr.push("JavaScript");
      } else if (ans[myKey] === "HTML") {
        arr.push("HTML");
      } else if (ans[myKey] === "CSS") {
        arr.push("CSS");
      } else if (ans[myKey] === "C++") {
        arr.push("C++");
      } else {
        arr.push("Python");
      }
    }
    
    console.log("domain arr ",arr);

    let transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL, // TODO: your gmail account
        pass: process.env.PASSWORD, // TODO: your gmail password
      },
    });

    // Step 2
    var fs = [];
    if (req.files != undefined) {
      for (var i = 0; i < req.files.length; i++) {
        fs.push({
          filename: req.files[i].filename,
          path: "./public/uploads/" + req.files[i].filename,
        });
      }
    }

    let prj1;
    prj.findOne({username:req.session.username},function(err,found){
      if(err)
      {
        throw err;
      }
      else{
        if(found===null)
        {
          let prjNew=new prj({
            username:req.session.username,
            project:{
              title:req.body.title,
              description:req.body.Write,
              files:fs,
              domain:arr
            }
          });
          prjNew.save(function(err){
            if(err)
            {
              throw err;
            }
            else{
              console.log("project created");
              var mailList = [];
              User.find({}, function (err, found) {
                
                for(var i=0;i<found.length;i++)
                {
                  if(found[i].domain.some(item => arr.includes(item))===true)
                  {
                    mailList.push(found[i].email);
                  }
                }
                if (req.body.mail === "mail it") {
                  let mailOptions = {
                    from: "aksjain891999@gmail.com", // TODO: email sender
                    to: mailList, // TODO: email receiver
                    subject:" Need a collaborator for the project : "+req.body.title,
                    text: "username : "+req.session.username + "\n "+req.body.Write,
                    attachments: fs,
          
                  };
                  transporter.sendMail(mailOptions, (err, data) => {
                    if (err) {
                      console.log(err);
                      
                    }
                  console.log("Email sent!!!");
                  });
                }
              });
              console.log("project",prj1);
              res.render("dashboard", {
                username: req.session.username,
                img_name: req.session.image,
                domain: req.session.domain,
                project:prjNew.project,
              });
            }
          })
        }
        else{
          prj1=found.project;
          prj.deleteOne({username:req.session.username},function(err,foundUser){
            if(err)
            {
              throw err;
            }
            else{
              prj1.push({title:req.body.title,description:req.body.Write,files:fs,domain:arr});
              let prjNew=new prj({
                username:req.session.username,
                project:prj1
              });
              prjNew.save(function(err){
                if(err)
                {
                  throw err;
                }
                else{
                  console.log("project created");
                  var mailList = [];
                  User.find({}, function (err, found) {
                    console.log("arr ",arr);
                    for(var i=0;i<found.length;i++)
                    {
                      if(found[i].domain.some(item => arr.includes(item))===true)
                      {
                        mailList.push(found[i].email);
                      }
                    }
                    if (req.body.mail === "mail it") {
                      let mailOptions = {
                        from: "aksjain891999@gmail.com", // TODO: email sender
                        to: mailList, // TODO: email receiver
                        subject:" Need a collaborator for the project : "+req.body.title,
                        text: "username : "+req.session.username + "\n "+req.body.Write,
                        attachments: fs,
              
                      };
                      transporter.sendMail(mailOptions, (err, data) => {
                        if (err) {
                          console.log(err);
                          
                        }
                      console.log("Email sent!!!");
                      });
                    }
                  });
                  console.log("project",prj1);
                  res.render("dashboard", {
                    username: req.session.username,
                    img_name: req.session.image,
                    domain: req.session.domain,
                    project:prj1,
                  });
                }
              })
            }
          })
        }
      }
  })
});

router.get("/username/:title",(req,res)=>{
  prj.findOne({username:req.session.username},function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      for(var i=0;i<found.project.length;i++)
      {
        if(found.project[i].title===req.params.title)
        {
          console.log("prj",found.project[i]);
          res.render("project",{project:found.project[i],username:req.session.username});
        }
      }
    }
  })
})


router.get("/search", function (req, res, next) {
  var x = req.query["term"];
  var regex = new RegExp("^" + x);
  if (x != undefined) {
    var userFilter = User.find({ username: { $regex: regex, $options: "i" } })
      .sort({ updated_at: -1 })
      .sort({ created_at: -1 })
      .limit(20);

    userFilter.exec(function (err, data) {
      //console.log("hi "+data);
      var result = [];

      if (!err) {
        if (data && data.length && data.length > 0) {
          data.forEach((foundUser) => {
            let obj = {
              id: foundUser._id,
              label: foundUser.username,
            };
            //console.log(foundUser.username);
            result.push(obj);
          });
        }
        res.jsonp(result);
      } else {
        console.log(err);
      }
    });
  }
});

router.post("/search", function (req, res, next) {
  var name = req.body.filtername;
  if (name === req.session.username) {
    res.render("dashboard", {
      username: req.session.username,
      img_name: req.session.image,
      domain: req.session.domain,
    });
  } else {
    User.findOne({ username: name }, function (err, found) {
      if (found) {
        res.render("searchUserDashboard", {
          username: found.username,
          img_name: found.image,
          searchUserID: found._id,
        });
      } else {
        req.flash("message", "user not found");
        res.redirect("/dashboard");
      }
    });
  }
});
router.get("/chat/:room",ensureAuthenticated, (req,res)=>{
chatRoom.find({roomName:req.params.room },function(err,found){
    console.log("foudn data",found," data end");
    if(found[0])
    {
      res.render("room",{roomName:req.params.room,username:req.session.username});
    }
    else{
      res.redirect("/");
    }
  })
})
      


  


router.post("/chat/room",ensureAuthenticated, (req,res)=>{
  chatRoom.find({roomName:req.body.room},function(err,found){
    if(err)
    {
      console.log("err");
    }
    else
    {
      console.log("found",found);
      if(found.length)
      {
        console.log("hi");
        return res.redirect('/');
      }
 
      let nChat = new chatRoom({
        roomName:req.body.room,
        conversation:[]
      });
      nChat.save(function(err){
        if(err)
        {
          console.log("error chat");
        }
        else{
          console.log("roomName saved");
          rooms[req.body.room] = { users: {} }
          res.redirect(req.body.room)
          // Send message that new room was created
          io.emit('room-created', req.body.room)
        }
      })

    }
  })
  
  
})

router.get("/chat",ensureAuthenticated, (req,res)=>{
  
  const t=[];
  chatRoom.find({ },function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      if(found.length)
      {
        for(var i=0;i<found.length;i++)
        {
          t.push(found[i].roomName);
        }
      }
      
      res.render("chatRoom",{rooms:t,username:req.session.username});
    }

  })
  
})

router.get("/logout", function (req, res, next) {
  req.logout();

  // destroy session data
  req.session = null;
  console.log("session",req.session);
  // redirect to homepage
  //res.redirect('/');
  res.render("index");
});

function ensureAuthenticated(req, res, next) {
  if (req.session.login === true) {
    console.log(req.session.username);
    return next();
  } else {
    res.redirect("/");
  }
}

//socket
io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room)
    name=username
    
    socket.to(room).broadcast.emit('user-connected', name)
    chatRoom.find({roomName:room },function(err,found){
      console.log(found[0]);
      if(found[0])
      {
        const chats=found[0].conversation;
        
        if(chats!=undefined)
        {
          for(var i=0;i<chats.length;i++)
          {
            socket.emit('chat-message', { message: chats[i].talk, name: chats[i].from })
          }
        }
        
      }
  })
})
  socket.on('send-chat-message', (room, message) => {
    
    chatRoom.find({roomName:room },function(err,found){
      let chat=[];
      chat=found[0].conversation;
      chat.push({from:username,talk:message});
      chatRoom.deleteOne({roomName:room},function(err,foundUser){
        if(err)
        {
          throw err;
        }
        else{
          let nChat1 = new chatRoom({
            roomName:room,
            conversation:chat
          });
          nChat1.save(function(err){
            if(err)
            {
              console.log("error ");
            }
            else{
              console.log(" saved");
            }
          })
        }
      })
      socket.to(room).broadcast.emit('chat-message', { message: message, name: username })
    })
    
    
  })


  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', username)
      delete rooms[room].users[username]
    })
  })
})

const updateData=async(roomName,chatData)=>{
  try{
    console.log("chatData",chatData);
    const res=await chatRoom.find({roomName:roomName});
    res.conversation=chatData;
    await  res.save(function(){})
      
    
  }
  catch(err)
  {
    console.log(err);
  }
}
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[username] != null) names.push(name)
    return names
  }, [])
}

module.exports = router;
