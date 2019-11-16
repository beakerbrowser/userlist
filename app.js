const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session')
const logger = require('morgan');
const AWSXRay = require('aws-xray-sdk');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;

const config = require('./lib/config')
const db = require('./lib/db')

const indexRouter = require('./routes/index');

module.exports = async function () {
  await db.setup()
  var app = express();

  var passportConfig = config.getPassportConfig()
  if (passportConfig.consumerKey && passportConfig.consumerSecret) {
    passport.use(new Strategy(passportConfig,
      function (token, tokenSecret, profile, cb) {
        db.knex('twitter_users')
          .where({username: profile.username})
          .asCallback((err, rows) => {
            if (err) return cb(err)
            var user = rows[0] || {}
            user.username = profile.username
            cb(null, user)
          })
        return cb(null, profile)
      }
    ))
    passport.serializeUser(function(user, cb) {
      cb(null, {username: user.username});
    });
    passport.deserializeUser(function(obj, cb) {
      cb(null, {username: obj.username});
    });
  } else {
    console.warn('Twitter oauth disabled: TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET not specified')
  }

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(AWSXRay.express.openSegment('Userlist'));
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(expressSession({secret: config.getSessionKey(), resave: true, saveUninitialized: true}));
  app.use(passport.initialize());
  app.use(passport.session());  

  app.use('/', indexRouter);
  app.get('/login/twitter', passport.authenticate('twitter'));
  app.get('/login/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    function (req, res) {
      res.redirect('/');
    }
  );

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.use(AWSXRay.express.closeSegment());

  return app
}
