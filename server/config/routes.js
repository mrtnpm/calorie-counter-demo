const _ = require('lodash');
const validate = require('express-validation');
const api = require('../api');
const authUtilities = require('../utilities/auth');
const path = require('path');
const ROLES = require('../models/roles');

module.exports = (app) => {
  //require('../services/user').create("administrator", 'password', 'ENTITY_ROLE_ADMIN', 10)
  //require('../services/user').create("manager", 'password', 'ENTITY_ROLE_MANAGER', 15)
  //require('../services/user').create("username", 'password', 'ENTITY_ROLE_USER', 20)

  const ensureAuth = authUtilities.ensureIsAuthenticated;
  const ensureNotAuth = authUtilities.ensureIsNotAuthenticated;
  const ensureRoles = authUtilities.ensureIsAuthorizedFor;

  // registration/authentication
  const authApi = api.authentication;
  app.post('/api/login', validate(authApi.login.schema), authApi.login);
  app.get('/api/logout', authApi.logout);

  // user api for current user
  const userApi = api.user;
  app.get('/api/me', ensureAuth, userApi.localGet);
  app.put('/api/me', ensureAuth, validate(userApi.localUpdate.schema), userApi.localUpdate);
  app.post('/api/register', ensureNotAuth, validate(userApi.register.schema), userApi.register);
  app.get('/api/users/:username/exists', validate(userApi.exists.schema), userApi.exists);

  // entries api for current user
  const entryApi = api.entry;
  app.get('/api/dailyCaloricIntake', ensureAuth, entryApi.currentUserDailyCaloricIntake);
  app.get('/api/entries/:entryId', ensureAuth, validate(entryApi.localGet.schema), entryApi.localGet);
  app.post('/api/entries', ensureAuth, validate(entryApi.localCreate.schema), entryApi.localCreate);
  app.get('/api/entries', ensureAuth, validate(entryApi.localList.schema), entryApi.localList);
  app.put('/api/entries/:entryId', ensureAuth, validate(entryApi.localUpdate.schema), entryApi.localUpdate);
  app.delete('/api/entries/:entryId', ensureAuth, validate(entryApi.localRemove.schema), entryApi.localRemove);

  // user api for admin/manager use
  const ensureManager = ensureRoles([ROLES.ENTITY_ROLE_ADMIN, ROLES.ENTITY_ROLE_MANAGER]);
  app.post('/api/users', ensureAuth, ensureManager, validate(userApi.create.schema), userApi.create);
  app.get('/api/users', ensureAuth, ensureManager, validate(userApi.list.schema), userApi.list);
  app.get('/api/users/:userId', ensureAuth, ensureManager, userApi.read);
  app.put('/api/users/:userId', ensureAuth, ensureManager, validate(userApi.update.schema), userApi.update);
  app.delete('/api/users/:userId', ensureAuth, ensureManager, validate(userApi.remove.schema), userApi.remove);

  // entries api for admin use
  const ensureAdmin = ensureRoles([ROLES.ENTITY_ROLE_ADMIN]);
  const updateUserEntriesMiddleware = [ensureAuth, ensureAdmin, validate(entryApi.create.schema)];
  app.post('/api/users/:userId/entries', updateUserEntriesMiddleware, entryApi.create);
  const listUserEntriesMiddleware = [ensureAuth, ensureAdmin, validate(entryApi.list.schema)];
  app.get('/api/users/:userId/entries', listUserEntriesMiddleware, entryApi.list);
  const updateUserEntryMiddleware = [ensureAuth, ensureAdmin, validate(entryApi.update.schema)]
  app.put('/api/users/:userId/entries/:entryId', ...updateUserEntryMiddleware, entryApi.update);
  const deleteUserEntryMiddleware = [ensureAuth, ensureAdmin, validate(entryApi.remove.schema)];
  app.delete('/api/users/:userId/entries/:entryId', ...deleteUserEntryMiddleware, entryApi.remove);

  app.use((err, req, res, next) => {
    if(err && err.errors) {
      return res.status(err.status).json(_.flatten(err.errors.map(error => error.messages)));
    } else if (err) {
      return res.sendStatus(500);
    }

    next();
  });

  if(process.env.NODE_ENV == 'production') {
    app.use('/', require('express').static(path.join(__dirname, '../../dist')));
    app.get('*', function(req, res) {
      res.sendfile(path.join(__dirname, '../../dist',  'index.html'));
    });
  }
  else {
    app.use('/', require('express-http-proxy')('localhost:3000'));
  }

  app.use((err, req, res, next) => {
    res.send(404)
  })

};

