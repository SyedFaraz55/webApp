require("dotenv").config();
const express = require("express");
const routes = require("./routes/routes");
const flash = require("connect-flash");
const session = require("express-session");
const db = require("./config/keys").mongoURI;
const passport = require("passport");
const app = express();  
const mongoose = require("mongoose");
require("./config/passport")(passport);
const {ensureAuthenticated} = require("./config/auth");	
const PORT = process.env.PORT || 4000;

mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log("connected to mongodb Atlas"))
.catch((err)=>console.log(err));
	
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));
app.set("view engine","ejs");

app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// gloabl variables

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");	
    next();
});


app.get("/",routes.Auth,routes.index);
app.get("/explore",routes.explore);
app.get("/signup",routes.Auth,routes.signup);
app.get("/signin",routes.Auth,routes.signin);
app.get("/logout",routes.logout);
app.get("/dashboard",ensureAuthenticated,routes.dashboard);
app.post("/signup",routes.Auth,routes.postSignup);
app.post("/signin",routes.Auth,routes.postSignin);
app.get("/verification/",routes.verify);
app.get("*",routes.notFound);



app.listen(3000,()=> console.log(`Listening to port ${PORT}`));