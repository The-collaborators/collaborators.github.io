const mongoose = require("mongoose");

//user schema
const projectSchema = mongoose.Schema({
    
    username: {
        type: String,
        //required: true
    },
    project:{
        type:Array,
        title:{
            type:String
        },
        description:{
            type:String
        },
        files:{
            type:Array
        },
        domain:{
            type:Array
        }
    }
    
});

//const User = mongoose.model("user", userSchema);

module.exports = project=mongoose.model("project", projectSchema);