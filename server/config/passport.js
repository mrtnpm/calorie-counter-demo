const LocalStrategy = require('passport-local').Strategy;
const userService = require('../services/user');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, (username, password, done) => {
    userService.findByUsername(username).then((user) => {
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }

      user.comparePassword(password, (err, isMatch) => {
        if(err) {
          return done(null, false, { message: 'Could not verify password' });
        }
        if(!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        }

        done(null, user);
      });
    }).catch((err) => {
      done(err);
    });
  }));

  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) => {
    userService.findById(id)
      .then(user => {cb(null, user);})
      .catch(cb);
  });
};
