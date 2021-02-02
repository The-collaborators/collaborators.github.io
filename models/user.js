const mongoose = require("mongoose");

//user schema
const userSchema = mongoose.Schema({
    
    email: {
        type: String,
        //required: true
    },
    username: {
        type: String,
        required: true
    },
    domain:{
        type:[String],
        default:undefined

    },
    image:{
        type:String
    }
});

//const User = mongoose.model("user", userSchema);

module.exports = User=mongoose.model("user", userSchema);