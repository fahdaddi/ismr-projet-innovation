const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs')
let  User = require('../models/user');

//home Page
router.get('/',ensureAuthenticated,(req,res,next)=>{
  res.render('index');
});
router.get('/robots/:name',ensureAuthenticated,(req,res,next)=>{
  res.render('robots',{
    video_src:req.body.name+".mkv"
  });
});
var results;
fs.readFile('json/map.json','utf8',(err,data)=>{
  if(err){
    throw err;
  } else{
    results=JSON.parse(data);
  }
});
router.get('/map',(req,res,next)=>{
  res.send(results);
});

//login Form
router.get('/login',(req,res,next)=>{
  res.render('login');
});

// Register Form
router.get('/register',(req,res,next)=>{
  res.render('register');
});

//log out
router.get('/logout',(req,res,next)=>{
  req.logout();
  req.flash('success_msg','Vous êtes déconecté');
  res.redirect('/login');
});

//Process Register
router.post('/register',(req,res,next)=>{
  const username = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name','le champs utilisateur est requis').notEmpty();
  req.checkBody('email','le champs email est requis').notEmpty();
  req.checkBody('email','le champs email doit être un email').isEmail();
  req.checkBody('password','le champs mot de passe est requis').notEmpty();
  req.checkBody('password2','le champs Valider le mot de passe est requis').notEmpty();
  req.checkBody('password2','les mots de passe doivent être identiques').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors: errors
    });
  } else{
    const newUser = new User({
      username: username,
      email:email,
      password:password
    });

    User.registerUser(newUser,(err, user)=>{
      if(err) {
        throw err;
        req.flash('error_msg','Une erreure s\'est produite durant l\'enregistrement')
      }
      req.flash('success_msg','Enregistré avec succès')
      res.redirect('/login');
    });
  }

});
//Local Strategy
passport.use(new LocalStrategy((username,password,done)=>{
  User.getUserByUsername(username,(err,user)=>{
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Ce compte n\'existe pas'});
    }
    User.comparePassword(password , user.password , (err, isMatch)=>{
      if(err) throw err;
      if(isMatch){
        return done(null, user);
      } else{
        return done(null, false , {message :'Mot de passe incorecte'});
      }
    });
  });
}));

//Cookies session Start
passport.serializeUser((user,done)=>{
  done(null, user.id);
});

//Cookies session end
passport.deserializeUser((id,done)=>{
  User.getUserById(id,(err,user)=>{
    done(err,user);
  });
});

//login Process
router.post('/login', (req,res,next)=>{
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  })(req,res,next);
});

//Access Control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
    req.flash('error_msg', 'Vous n\'êtes pas autorisé à voir ce contenu!');
  } else{
    res.redirect('/login');
  }
}

module.exports = router;
