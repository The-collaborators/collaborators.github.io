const user = require("../models/user");

const router = require("express").Router();

router.get("/",(req,res)=>{
    res.render("userDomain", { username: req.session.username });
})

router.post("/",(req,res)=>{
    ans = JSON.stringify(req.body);
    ans = JSON.parse(ans);
    ans=ans.finalList;
    req.session.domain=ans;
    user.findOne({username:req.session.username},function(err,found){
        if(err)
        {
            throw err;
        }
        else{
            found.domain=req.session.domain;
            found.save(function(err){
                if(err)
                {
                    throw err;
                }
                else{
                    
                    res.redirect("/dashboard");
                }
            })
        }
    })

})

module.exports = router;