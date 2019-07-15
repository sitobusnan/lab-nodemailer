const nodemailer = require('nodemailer')

const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sito.ironhack@gmail.com',
    pass: 'HackIron.1' 
  }
});

router.get("/login", (req, res, next) => {
  console.log("🎉")
  res.render("auth/login", { message: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const characters ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < 25; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
      confirmationCode: token,
      email: email
    });

    newUser
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        res.render("auth/signup", { message: "Something went wrong" });
      });
  });
  console.log(req.body.email);
  transporter.sendMail({
    from: '"SITO PORNO STAR 🤪" <sito.ironhack@gmail.com>',
    to: email, 
    subject: "Confirmation mail IronHack Sito", 
    text: "Esquilame",
    html: `<!DOCTYPE html>
    <html
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
    >
      <head>
        <title> CONFIRMATION MAIL</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          body {
            margin: 0 auto;
            padding: 0;
            width: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            margin-bottom: 30px;
    
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
          a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40%;
            height: 30px;
            text-align: center;
          }
        </style>
      </head>
      <body style="background-color:#bedae6;">
        <img
          alt="header image"
          height="auto"
          src="https://i.ytimg.com/vi/WZj3ail_rIY/hqdefault.jpg"
          style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;"
        />
        <a
          href="http://localhost:3001/auth/confirm/${token}"
          style="background: #dbdbdb; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 120%; Margin: 0; text-transform: none; text-decoration: none; color: inherit;"
          target="_blank"
        >
          ESQUILAME JODERRR!!!
        </a>
      </body>
    </html>    
   `
  })
  .then(info => res.render('message', {email, subject, message, info}))
  .catch(error => console.log(error));
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/confirm/:confirmCode", (req, res) => {
  
  User.findOneAndUpdate({confirmationCode:req.params.confirmCode},{$set:{status:"Active"}},{new: true})
  .then((user)=>{
    res.render("profile",{user})
  }).catch(()=>{
    console.log("A ocurrido un error de activacion")
  })
    
  
    
  
  
})

module.exports = router;
