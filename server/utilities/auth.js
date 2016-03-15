function ensureIsAuthenticated(req, res, next) {
  if(!req.user) {
    return res.cookie('authenticated', false).sendStatus(401);
  }

  next();
}
function ensureIsNotAuthenticated(req, res, next) {
  if(req.user) {
    return res.status(400).send('This action cannot be performed while authenticated.');
  }

  next();
}
function ensureIsAuthorizedFor(roles) {
  if(!roles && !roles.length) {
    throw new Error('At least one role is required.');
  }

  return (req, res, next) => {
    if(roles.indexOf(req.user.role) < 0) {
      return res.sendStatus(401);
    }

    next();
  };
}

module.exports = {
  ensureIsAuthenticated,
  ensureIsNotAuthenticated,
  ensureIsAuthorizedFor
};
