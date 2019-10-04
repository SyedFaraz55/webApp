const Joi = require("@hapi/joi");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const {ensureAuthenticated} = require("../config/auth");

const passport = require("passport"); 

exports.index = function(req, res) {
  res.render("index");
};
exports.explore = function(req, res) {
  res.send("explore events");
};
exports.signin = function(req,res,next) {
 res.render("signin");
};
exports.signup = function(req, res) {
  res.render("signup");
};
exports.dashboard = function(req,res){
  res.render("dashboard");  
}
exports.notFound = function(req,res){
  res.render("notfound");
}
exports.logout = function(req,res) {
  req.logout();
  req.flash("success_msg","You are logged out !");
  res.redirect("/signin");
}
exports.postSignup = function(req,res){
  const {name,email,password,password2} = req.body;
  let errors = [];
  if(!name || !email || !password || !password2){
    errors.push({msg:"Please fill in all fields !"});
  }

  if(password != password2){
    errors.push({msg:"Password do not match"});
  }

  if(password.length < 6){
    errors.push({msg:"Password must be 6 characters long"});
  }

  if(errors.length > 0){
    res.render("signup",{
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({email:email})
    .then(user=>{
      if(user){
        errors.push({msg:"Email is already exits !"});
        res.render("signup",{
          errors,
          name,
          email,
          password,
          password2
        });
      }else{
        const newUser = new User({
          name,
          email,
          password
        });
        
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
            .then(user=>{
              req.flash("success_msg","Please login to continue..");
              res.redirect("/signin");
            })
            .catch(err=>console.log(err));
          })
        })
      }
    })
  }
} 

exports.postSignin = function(req,res,next){
  passport.authenticate('local',{
    successRedirect:"/dashboard",
    failureRedirect:"/signin",
    failureFlash:true
  })(req,res,next);
}

exports.notAuth = function(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect("/dashboard");
  } 
  next();
}
