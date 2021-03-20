//const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


//chat schema
const chatDetailSchema = mongoose.Schema({
    
    from: {
        type: String,
        //required: true
    },
    talk: {
        type: String,
        //required: true
    }
});

//const User = mongoose.model("user", userSchema);

module.exports = chatDetail=mongoose.model("chatDetail", chatDetailSchema);