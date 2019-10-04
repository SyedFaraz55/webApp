module.exports = {
    ensureAuthenticated:function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg',"Please Login to view resource");
        res.redirect("/signin");
    }
}