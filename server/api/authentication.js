const passport = require('passport');
const Joi = require('joi');

function login(req, res, next) {
  passport.authenticate('local', (authErr, user) => {
    if(authErr || !user) {
      return res.sendStatus(401);
    }

    req.logIn(user, (loginErr) => {
      if(loginErr) {
        return next(loginErr);
      }
      res.cookie('authenticated', true);
      res.json(req.user.toJSON());
    });
  })(req, res, next);
}
login.schema = {
  body: {
    username: Joi.string().required(),
    password: Joi.string().required()
  }
};

function logout(req, res) {
  res.clearCookie('authenticated');
  req.logout();
  res.sendStatus(200);
}

module.exports = {
  login,
  logout
};
