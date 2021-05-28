const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


//chat schema
const roomSchema = mongoose.Schema({
    
    roomName:{
        type:String
    },
    owner:{
        type:String
    },
    conversation:{
        type:Array,
        
            from:{
                type:String
            },
            talk:{
                type:String
            }
        

    }
});

//const User = mongoose.model("user", userSchema);

module.exports = roomName=mongoose.model("room", roomSchema);