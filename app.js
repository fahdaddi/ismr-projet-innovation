const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoos = require('mongoose');
const fs = require('fs');

var json;
fs.readFile('json/map.json','utf8',(err,data)=>{
  if(err){
    throw err;
  } else{
    json=JSON.parse(data);
  }
});

const port = 8080;

const index = require('./routes/index');
const users = require('./routes/users');

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Init passport
app.use(passport.initialize());
app.use(passport.session());


// Express messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.robots = json;
  next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',index);
app.use('/users',users);

//start Server
app.listen(port,()=>{
  console.log('Server Started at port'+port);
})
