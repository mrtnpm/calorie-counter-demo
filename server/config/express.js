const session = require('express-session');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);

module.exports = (app, passport, config) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cookieSession({ secret: config.cookie.secret }));
  app.use(session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: config.db,
      collection: 'sessions'
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};

