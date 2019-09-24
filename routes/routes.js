const Joi = require("@hapi/joi");

const schema = Joi.object({
    username:Joi.string().alphanum().min(3).max(30).required(),
	password: Joi.string().min(10).max(30).required(),
	// repeat_password:Joi.ref("password"),
    email: Joi.string()
        .email().required()

});

exports.index = function(req,res){
    res.render("index");
}
exports.explore = function(req,res){
    res.send("explore events");
}
exports.signin = function(req,res){
    res.render("signin");
}
exports.signup = function(req,res){
    res.render("signup");
}
exports.postSignup = function(req,res){
    const {user,email,password,repass} = req.body;
    const {error,value} = schema.validate({username:user,password:password,email:email});
	let errors = [];
	let err = error;
	//check password
	if(!user || !email || !password || !repass){
		errors.push({msg:"Please fill in all fields"});
	}
	if(password !== repass){
		errors.push({msg:"password do not match"});
	}
	if(errors.length > 0){
		res.render("signup",{
			err,
			errors,
			user,
			email,
			password,
		});
	} else {
		res.send("done");
	}
}