const router = require("express").Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const flash = require("connect-flash");
const chatRoom=require("../models/room")
const io = require('socket.io')(listen);
const prj=require("../models/project");
const fs=require("fs");
const mongoose=require("mongoose");
mongoose.Promise=require("bluebird");
const rooms={};
let username;
var ans;


router.use(flash());
router.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});

//used for multer
var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now()+"_"+file.originalname 
    );
  },
});



var upload = multer({
  storage: storage,
});

router.get("/", ensureAuthenticated, (req, res) => {

  
    prj.findOne({username:req.session.username},function(err,found){
      if(err)
      {
        throw err;
      }
      else{
        //console.log("prj ",found);
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
          console.log("found project",found.project);
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
  
  let img = req.file;
  
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
  else if(req.body.remove==="Remove")
  {
    req.session.image = "default-image-png.png";
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
  prj.findOne({username:req.session.username},function(err,found){
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
    //console.log("domain",ans);
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
    
    //console.log("domain arr ",arr);

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
        //req.files[i].originalname=Date.now()+"_"+req.files[i].originalname;
        fs.push({
          filename: req.files[i].filename,
          path: "./public/uploads/" +req.files[i].filename,
        });
      }
    }

    let prj1;
    prj.findOne({username:req.session.username},function(err,found){
      if(err)
      {
        throw err;
      }
      else
      {
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
              User.find({}).then(function (found) {
                console.log("arr ",arr);
                for(var i=0;i<found.length;i++)
                {
                  if((found[i].domain.some(item => arr.includes(item))===true) && found[i].email!=req.session.email)
                  {
                    mailList.push(found[i].email);
                    //console.log("email",found[i].email);
                  }
                }
                return Promise.all(mailList);
              }).then(function(mailList){
                console.log("mail",mailList);
                if (req.body.mail === "mail it" && mailList.length>0) {

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
              
              //console.log("project",prj1);

                res.redirect("/dashboard");
              }).catch(function(err){
              throw err;
              });
            }
          })
        }
        else
        {
          prj1=found.project;
          prj.deleteOne({username:req.session.username},function(err,foundUser){
            if(err)
            {
              throw err;
            }
            else
            {
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
                else
                {
                  console.log("project created");
                  var mailList = [];
                  User.find({}).then(function (found) {
                    console.log("arr ",arr);
                    for(var i=0;i<found.length;i++)
                    {
                      if((found[i].domain.some(item => arr.includes(item))===true) && found[i].email!=req.session.email)
                      {
                        mailList.push(found[i].email);
                        console.log("email",found[i].email);
                      }
                    }
                    return Promise.all(mailList);
                  }).then(function(mailList){
                    console.log("mail",mailList);
                    if (req.body.mail === "mail it" && mailList.length>0) {
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
                  
                  //console.log("project",prj1);

                    res.redirect("/dashboard");
                  }).catch(function(err){
                  throw err;
                  });
                }
              })
            }
          });
        }
      }
    });
    
});






router.get("/username/:index",(req,res)=>{
  prj.findOne({username:req.session.username},function(err,found){
    if(err)
    {
      throw err;
    }
    else{

      res.render("project",{project:found.project[req.params.index],username:req.session.username});
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
     
      var result = [];

      if (!err) {
        if (data && data.length && data.length > 0) {
          data.forEach((foundUser) => {
            let obj = {
              id: foundUser._id,
              label: foundUser.username,
            };
            
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
      if (found!=null) {

        prj.findOne({username:name},function(err,foundUser){
          if(err)
          {
            throw err;
          }
          else{
            console.log("foundUser",foundUser);
            if(foundUser!=null)
            {
              res.render("searchUserDashboard", {
                username: found.username,
                img_name: found.image,
                searchUserID: found._id,
                domain:found.domain,
                project:foundUser.project
              });
            }
            else{
                res.render("searchUserDashboard", {
                username: found.username,
                img_name: found.image,
                searchUserID: found._id,
                domain:found.domain,
                project:[]
              });
            }
          }
        })
        
      } else {
        req.flash("message", "user not found");
        res.redirect("/dashboard");
      }
    });
  }
});


router.get("/searchUser/:username/:index",(req,res)=>{
  prj.findOne({username:req.params.username},function(err,found){
    res.render("searchUserProject",{project:found.project[req.params.index],username:req.session.username});
  })
})

router.get("/searchUser/:username",(req,res)=>{
  User.findOne({username:req.params.username},function(err,found){
    prj.findOne({username:req.params.username},function(err,foundUser){
      if(err)
      {
        throw err;
      }
      else{
        //console.log("foundUser",foundUser);
        if(foundUser!=null)
        {
          res.render("searchUserDashboard", {
            username: found.username,
            img_name: found.image,
            searchUserID: found._id,
            domain:found.domain,
            project:foundUser.project
          });
        }
        else{
            res.render("searchUserDashboard", {
            username: found.username,
            img_name: found.image,
            searchUserID: found._id,
            domain:found.domain,
            project:[]
          });
        }
      }
    })
  })
})

router.get("/chat/:room",ensureAuthenticated, (req,res)=>{
  //console.log("chat room hello");
chatRoom.find({roomName:req.params.room },function(err,found){
    //console.log("foudn data",found," data end");
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
      //console.log("found",found);
      if(found.length)
      {
        //console.log("hi");
        req.flash("message", "room already exists");
        return res.redirect('/dashboard/chat');
      }
 
      let nChat = new chatRoom({
        roomName:req.body.room,
        conversation:[],
        owner:req.session.username
      });
      nChat.save(function(err){
        if(err)
        {
          console.log("error chat");
        }
        else{
          console.log("roomName saved",nChat);
          rooms[req.body.room] = { users: {} }
          //var url="/dashboard/chat/"+req.body.room;

        }
        res.redirect(req.body.room)
          
        // Send message that new room was created
        io.emit('room-created', req.body.room)
      })

    }
  })
  
  
})

router.get("/download/:file",ensureAuthenticated,(req,res)=>{


  const f2=path.join(__basedir+"/public/uploads/",req.params.file);
 
  res.download(f2);

})



router.get("/chat",ensureAuthenticated, (req,res)=>{
  
  
    const t=[];
    chatRoom.find({}).then(function (found) {
      for(var i=0;i<found.length;i++)
      {
        t.push({roomName:found[i].roomName,owner:found[i].owner});
        console.log(found[i].owner);
      }
      return Promise.all(t);
    }).then(function(t){
      console.log("rooms",t);
      res.render("chatRoom",{rooms:t,username:req.session.username,roomName:""});
    }).catch(function(err){
    throw err;
    });
})

router.get("/chat/delete/:roomName",(req,res)=>{
  chatRoom.deleteOne({roomName:req.params.roomName},function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      res.redirect("/dashboard/chat");
    }
  })
})


router.post("/project/delete/:index",(req,res)=>{
  prj.findOne({username:req.session.username},function(err,found){
    if(err)
    {
      throw err;
    }
    else{
      
      found.project.splice(req.params.index,1);
      found.save(function(error){
        if(error)
        {
          throw error;
        }
        else{
          res.redirect("/dashboard");
        }
      })
      //console.log(found,"delete");
      
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
    //name=username
    if(rooms[room]===undefined)
    {
      rooms[room] = { users: {} }
    }
    rooms[room].users[socket.id] = name
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
    
    chatRoom.findOne({roomName:room },function(err,found){
      let chat=[];
      chat=found.conversation;
      let owner=found.owner;
      chat.push({from:rooms[room].users[socket.id],talk:message});
      chatRoom.deleteOne({roomName:room},function(err,foundUser){
        if(err)
        {
          throw err;
        }
        else{
          let nChat1 = new chatRoom({
            roomName:room,
            conversation:chat,
            owner:owner
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
      socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
    
    
  })


  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})


function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

module.exports = router;
