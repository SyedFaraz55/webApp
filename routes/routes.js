const Joi = require("@hapi/joi");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { ensureAuthenticated } = require("../config/auth");

const passport = require("passport");
const secret = process.env.SECRET;
const rand = Math.floor(Math.random() * 9999);
const ConfirmHashed = crypto.createHmac('sha256', secret).update("i Love eb(eventBay)" + rand).digest("hex");

exports.index = function(req, res) {
    res.render("index");
};
exports.explore = function(req, res) {
    res.send("explore events");
};
exports.signin = function(req, res, next) {
    res.render("signin");
};
exports.signup = function(req, res) {
    res.render("signup");
};
exports.dashboard = function(req, res) {
    res.render("dashboard", { user: req.user });
    console.log(req.user);
}
exports.notFound = function(req, res) {
    res.render("notfound");
}
exports.logout = function(req, res) {
    req.logout();
    req.flash("success_msg", "You are logged out !");
    res.redirect("/signin");
}
exports.verify = function(req, res) {
    const code = req.query.id;
    User.updateOne({ hash: ConfirmHashed }, { $set: { confirm: true } })
        .then((data) => {
            req.flash("success_msg", "Account Verified,You can now login!");
            res.redirect("/signin");
            console.log("done");
        })
        .catch(err => console.log(err));
}
exports.postSignup = function(req, res) {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields !" });
    }

    if (password != password2) {
        errors.push({ msg: "Password do not match" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be 6 characters long" });
    }

    if (errors.length > 0) {
        res.render("signup", {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: "Email is already exits !" });
                    res.render("signup", {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                        confirm: false,
                        hash: ConfirmHashed
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    // req.flash("success_msg","Please login to continue..");
                                    // res.redirect("/signin");
                                    res.sendFile(path.join(__dirname, "../public/confirm.html"));


                                    async function main() {

                                        // create reusable transporter object using the default SMTP transport
                                        const transporter = nodemailer.createTransport({
                                            host: 'smtp.ethereal.email',
                                            port: 587,
                                            auth: {
                                                user: 'buford.senger@ethereal.email',
                                                pass: 'Xgj3w71BEkHNY2mdvK'
                                            }
                                        })

                                        let info = await transporter.sendMail({
                                            from: '"Fred Foo 👻" <theventapp@cs316.dx.am>', // sender address
                                            to: email, // list of receivers
                                            subject: 'Hello ✔', // Subject line
                                            text: "verification code from eventbay 6601", // plain text body
                                            html: `<a href="http://www.localhost:3000/verification/?id=${ConfirmHashed}">Click to verify your account</a>` // html body
                                        });

                                        console.log('Message sent: %s', info.messageId);
                                        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                                        // Preview only available when sending through an Ethereal account
                                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                                    }

                                    main().catch(console.error);

                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            })
    }



} //signup

exports.postSignin = function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: "/dashboard",
        failureRedirect: "/signin",
        failureFlash: true
    })(req, res, next);
}

exports.notAuth = function(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    next();
}