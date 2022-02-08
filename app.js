var createError = require('http-errors');
var express = require('express');
var configs = require('./config');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');


var usersRouter = require('./routes/users.route');
var otpRouter = require('./routes/otp.route');

const passport = require('passport');

var app = express();
app.use(cors());

// if(process.env.NODE_ENV != 'production'){
//   require('dotenv').config();
// }



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Routes
app.use('/users', usersRouter);
app.use('/otp', otpRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var RedisStore = configs.Redis.RedisStore;
app.use(session({
    secret: process.env.CLIENT_SECRET || "super secret string",
    //maxAge: 900000/*7200000*/, // 15 minutes Session lifetime
    resave: false,
    saveUninitialized : false,
    //store: new RedisStore({client: configs.Redis.RedisClient, ttl : 900}) // 15 minutes Session lifetime
}));

app.use(passport.initialize());
app.use(session({secret:'key'}))
app.use(passport.session());
require('./middlewares/passportConfig')(passport)




module.exports = app;
