require("dotenv").config();
const express = require("express");
const routes = require("./routes/routes");
const app = express();  
const PORT = process.env.PORT || 4000

app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));
app.set("view engine","ejs");


app.get("/",routes.index);
app.get("/explore",routes.explore);
app.get("/signup",routes.signup);
app.get("/signin",routes.signin);
app.post("/signup",routes.postSignup);

app.listen(3000,()=> console.log(`Listening to port ${PORT}`));