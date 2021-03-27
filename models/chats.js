const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const chatDetail = require('../models/chatDetail');

//chat schema
const chatSchema = mongoose.Schema({
    
    user1: {
        type: ObjectId,
        //required: true
    },
    
    user2: {
        type: ObjectId,
        //required: true
    },
    conversation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'chatDetail',
        default:undefined

    }
});

//const User = mongoose.model("user", userSchema);

module.exports = chat=mongoose.model("chat", chatSchema);