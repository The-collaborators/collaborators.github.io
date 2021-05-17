const router = require("express").Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const flash = require("connect-flash");
const chatDetail = require("../models/chatDetail");
const chat = require("../models/chats");
const chatRoom=require("../models/room")
const io = require('socket.io')(listen);


//try
const rooms={};
let username;

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
  //res.send(req.flash('message'));
  //io=req.io;

  // io.on('connection', (socket) => {
  //   user[req.session.username]=socket.id;
  //   console.log('a user connected');
    
  // })
  // console.log("hello " + res.locals.message);
  // console.log(req.session.domain);
  username=req.session.username
  res.render("dashboard", {
    username: req.session.username,
    img_name: req.session.image,
    domain: req.session.domain,
  });
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
  res.render("dashboard", {
    username: req.session.username,
    img_name: req.session.image,
    domain: req.session.domain,
  });
});
router.get("/mail", [ensureAuthenticated], function (req, res, next) {
  res.render("mail", { username: req.session.username });
});

router.post("/mail",[ensureAuthenticated, upload.array("file", 5)],
  function (req, res, next) {
    //console.log(req.files);

    var ans = JSON.stringify(req.body);
    ans = JSON.parse(ans);
    console.log(ans.finalList, " yeah");
    var arr = [];
    for (var myKey in ans.finalList) {
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

    var mailList = [];
    User.find({}, function (err, found) {
      // for(var i=0;i<found.length;i++)
      // {
      //     if(found[i].domain.some(item => arr.includes(item))===true)
      //     {
      //         //console.log(found[i].email,"mail");
      //         mailList.push(found[i].email);
      //         console.log(mailList,"mail1");
      //     }
      //     //console.log(found[i]["domain"],found[i]["username"]);

      // }

      mailList.push("18bcs2152@cuchd.in");

      if (req.body.mail === "mail it") {
        console.log(arr, "domain");
        let mailOptions = {
          from: "aksjain891999@gmail.com", // TODO: email sender
          to: mailList, // TODO: email receiver
          subject: "Nodemailer - Test",
          text: "hello",
          attachments: fs,
          // { filename: 'uploads/profile.JPG', path: './images/profile.JPG' },
          // { filename: 'images/coder girl.JPG', path: './images/coder girl.JPG' } // TODO: replace it with your own image
        };
        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            console.log(err);
            //return log('Error occurs');
          }

          console.log("Email sent!!!");
        });
      }
    });

    res.render("mail", { username: req.session.username });
  }
);

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

// router.get("/search/chat/:searchUserID", function (req, res, next) {
//   //const io = req.io;
  
//   let min, max, searchUser;
//   User.findById(req.params.searchUserID, function (err, found) {
//     searchUser = found.username;
//   });
//   //console.log("userID",req.params.searchUserID);
//   if (req.params.searchUserID > req.session.userID) {
//     min = req.session.userID;
//     max = req.params.searchUserID;
//   } else {
//     max = req.session.userID;
//     min = req.params.searchUserID;
//   }
  
//   io.on("connection", async (socket) => {
//     console.log("a user connected",socket.id);
    
//     let chatArr = [];
    
//     try {
//       const found = await chat.find({ user1: min, user2: max }).exec();
//       const t = found.map((a) => a.conversation);
//       chatArr = await chatDetail.find({ _id: { $in: t } }).exec();
//     } catch (e) {
//       console.log(e);
//     }
//     console.log(chatArr);
//     try{
//       console.log("output:");
//       io.to(user[req.session.username]).emit("output",chatArr,req.session.userID,req.params.searchUserID);
//       //socket.to()
//     }
//     catch (e){
//         console.log(e,"error");
//     }

//         socket.on("input",msg=>{
//             msg.from=req.session.userID;
            
            
//             let nChatDetail=new chatDetail({
//                 from:req.session.userID,
//                 talk:msg.talk
//             });
//             nChatDetail.save(function(err){
//                 if(err)
//                 {
//                     console.log("error chatdeatil");
//                 }
//                 else{
//                     //console.log("chatdetail saved",nChatDetail);
//                 }
//             });
//             let nChat = new chat({
//                 user1:min,
//                 user2:max,
//                 conversation:nChatDetail._id
//             });
//             nChat.save(function(err){
//                 if(err)
//                 {
//                     console.log("error chat");
//                 }
//                 else{
//                     //console.log("chat saved",nChat);
//                 }
//             });
//             let socket_id=user[searchUser];
//             io.to(socket_id).emit("output",chatArr,req.session.userID,req.params.searchUserID);
//             //nChatDetail.save();
//             //console.log(typeof(msg));
//         });

//         socket.on('disconnect', () => {
          
//           console.log('user disconnected');
          
//         });
//   });

//   res.render("chat", { searchUser: searchUser, user: req.session.username });
// });

//room
router.get("/chat/:room",(req,res)=>{
  //console.log("rooms",rooms);
  // let room=req.params.room;
  // chatRoom.find({roomName:req.params.room },function(err,found){
  //   console.log(found[0]);
  //   if(found[0])
  //   {
  //     const chats=found[0].conversation;
  //     //console.log("yo",found.conversation);
  //     if(chats!=undefined)
  //     {
  //       for(var i=0;i<chats.length;i++)
  //       {
  //         if(chats[i].from!=req.session.username)
  //         {
  //           //io.to(room).broadcast.emit('chat-message', { message: chats[i].talk, name: chats[i].from })
  //           io.emit('send-chat-history',{room:room,message:chats[i].talk,from:chats[i].from})
  //         }
  //         else{
  //           let obj={name:"You",message:chats[i].talk};
  //           io.to(room).broadcast.emit('chat-message', obj)
  //           //io.emit('send-chat-history',{room:room,message:chats[i].talk,from:chats[i].from})
  //         }
  //       }
  //     }
      
  //     res.render("room",{roomName:req.params.room});
  //   }
  chatRoom.find({roomName:req.params.room },function(err,found){
    if(found[0])
    {
      res.render("room",{roomName:req.params.room,username:req.session.username});
    }
    else{
      res.redirect("/");
    }
  })
      
});

  


router.post("/chat/room",(req,res)=>{
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
      // if (rooms[req.body.room] != null) {
      //   return res.redirect('/')
      // }
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
        }
      })
      rooms[req.body.room] = { users: {} }
      res.redirect(req.body.room)
      // Send message that new room was created
      io.emit('room-created', req.body.room)
    }
  })
  
  
})

router.get("/chat",(req,res)=>{
  //console.log("chatRoom");
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
    //rooms[room].users[username] = name
    socket.to(room).broadcast.emit('user-connected', name)
    chatRoom.find({roomName:room },function(err,found){
      console.log(found[0]);
      if(found[0])
      {
        const chats=found[0].conversation;
        //console.log("yo",found.conversation);
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
