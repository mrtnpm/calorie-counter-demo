const ROLES = require('../models/roles');
const userService = require('../services/user');
const Joi = require('joi');
const _ = require('lodash');

function create(req, res, next) {
  const localUser = req.user;
  const data = _.pick(req.body, Object.keys(create.schema.body));

  // only admins can create non-user roles
  if(localUser.role !== ROLES.ENTITY_ROLE_ADMIN && data.role !== ROLES.ENTITY_ROLE_USER) {
    return res.status(401).send('Unauthorized');
  }

  userService.create(data.username, data.password, data.role, data.expectedDailyCalories)
    .then(user => res.json(user))
    .catch(next);
}
create.schema = {
  body: {
    role: Joi.any().only(ROLES.values).required(),
    username: Joi.string().min(6).max(15).required(),
    password: Joi.string().min(8).max(30).required(),
    expectedDailyCalories: Joi.number().min(0).required()
  }
};

function exists(req, res, next) {
  userService.findByUsername(req.params.username).then((user) => {
    res.json({ exists: user ? true : false });
  })
}
exists.schema = {
  params: {
    username: Joi.string().min(6).max(15).required()
  }
}

function register(req, res, next) {
  const data = _.pick(req.body, Object.keys(register.schema.body));
  userService.create(data.username, data.password, ROLES.ENTITY_ROLE_USER, data.expectedDailyCalories)
    .then((user) => {
      if (!user) {
        return res.status(400).send('A user could not be created.');
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        res.json(user);
      });
    })
    .catch(next);
}
register.schema = {
  body: {
    username: create.schema.body.username,
    password: create.schema.body.password,
    expectedDailyCalories: create.schema.body.expectedDailyCalories
  }
};

function remove(req, res, next) {
  userService.remove(req.params.userId)
    .then((deletedEntry) => res.sendStatus(deletedEntry ? 200 : 304))
    .catch(next);
}
remove.schema = {
  params: {
    userId: Joi.string().required()
  }
};

const updateSchema = {
  role: Joi.any().only(ROLES.values).optional(),
  password: Joi.string().min(8).max(30).optional(),
  expectedDailyCalories: Joi.number().min(0).optional()
};
const updateSchemaFields = Object.keys(updateSchema);
function update(req, res, next) {
  var roles;
  const localUser = req.user;
  const data = _.pick(req.body, updateSchemaFields);

  switch(localUser.role) {
    case ROLES.ENTITY_ROLE_ADMIN:
      roles = [ROLES.ENTITY_ROLE_ADMIN, ROLES.ENTITY_ROLE_MANAGER, ROLES.ENTITY_ROLE_USER];
      break;
    case ROLES.ENTITY_ROLE_MANAGER:
      roles = [ROLES.ENTITY_ROLE_USER];

      if(data.role && data.role !== ROLES.ENTITY_ROLE_USER) {
        res.sendStatus(401);
        return;
      }
      break;
    default:
      roles = [];
  }

  userService.updateUserWithRoles(req.params.userId, roles, data)
    .then((updatedEntry) => res.sendStatus(updatedEntry ? 200 : 304))
    .catch(next);
}
update.schema = {
  params: {
    userId: Joi.string().required()
  },
  body: Joi.object().keys(updateSchema).or(updateSchemaFields)
};

const localUpdateSchema = {
  password: Joi.string().min(8).max(30).optional(),
  expectedDailyCalories: Joi.number().min(0).optional()
};
const localUpdateSchemaFields = Object.keys(localUpdateSchema);
function localUpdate(req, res, next) {
  const localUser = req.user;
  const data = _.pick(req.body, localUpdateSchemaFields);

  userService.updateUserWithRoles(localUser.id, localUser.role, data)
    .then((updatedEntry) => {
      if(!updatedEntry) {
        return res.sendStatus(304)
      }
      req.login(updatedEntry, function(err) {
        if(err) {
          next(err)
        }
        res.sendStatus(200);
      })
    })
    .catch(next);
}
localUpdate.schema = {
  body: Joi.object().keys(localUpdateSchema).or(localUpdateSchemaFields)
};
function localGet(req, res, next) {
  res.json(req.user);
}

function list(req, res, next) {
  var roles;

  switch(req.user.role) {
    case ROLES.ENTITY_ROLE_ADMIN:
      roles = [ROLES.ENTITY_ROLE_ADMIN, ROLES.ENTITY_ROLE_MANAGER, ROLES.ENTITY_ROLE_USER];
      break;
    case ROLES.ENTITY_ROLE_MANAGER:
      roles = [ROLES.ENTITY_ROLE_USER];
      break;
    default:
      roles = [];
  }

  const data = _.pick(req.query, Object.keys(list.schema.query));
  userService.paginateUsersByRoles(roles, data).then(pageData => res.json(pageData)).catch(next);
}
list.schema = {
  query: {
    page: Joi.number().min(0).required(),
    limit: Joi.number().min(1).max(10).required()
  }
};

function read(req, res, next) {
  userService.findById(req.params.userId).then(user => res.json(user).catch(next))
}

module.exports = {
  exists,
  register,
  create,
  update,
  remove,
  localUpdate,
  localGet,
  read,
  list
};
