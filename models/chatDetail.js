//const { ObjectId } = require("mongodb");
const { ObjectId } = require("bson");
const mongoose = require("mongoose");


//chat schema
const chatDetailSchema = mongoose.Schema({
    
    from: {
        type: ObjectId,
        //required: true
    },
    talk: {
        type: String,
        //required: true
    }
});

//const User = mongoose.model("user", userSchema);

module.exports = chatDetail=mongoose.model("chatDetail", chatDetailSchema);