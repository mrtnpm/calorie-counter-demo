const entryService = require('../services/entry');
const Joi = require('joi');
const _ = require('lodash');
const moment = require('moment');

function paginateUserEntries(userId, data, res, next) {
  entryService
    .paginateUserEntries(userId, data)
    .then(pageData => res.json(pageData))
    .catch(next);
}
function createUserEntry(userId, data, res, next) {
  entryService
    .create(userId, data.calories, data.date, data.time, data.title)
    .then(entry => res.json(entry))
    .catch(next);
}
function updateUserEntry(userId, entryId, data, res, next) {
  entryService
    .update(userId, entryId, data)
    .then(entry => res.sendStatus(entry ? 200 : 304))
    .catch(next);
}
function removeUserEntry(userId, entryId, res, next) {
  entryService.remove(userId, entryId)
    .then((deletedEntry) => {
      res.sendStatus(deletedEntry ? 200 : 304);
    })
    .catch(next);
}

// create for user
const createEntrySchema = {
  body: {
    calories: Joi.number().min(0).required(),
    date: Joi.number().positive().required(),
    time: Joi.number().min(0).max(1440).required(),
    title: Joi.string().required()
  }
};
const entryFields = Object.keys(createEntrySchema.body);
function localCreate(req, res, next) {
  createUserEntry(req.user.id, _.pick(req.body, entryFields), res, next);
}
localCreate.schema = createEntrySchema;

// create for admin
function create(req, res, next) {
  createUserEntry(req.body.userId, _.pick(req.body, entryFields), res, next);
}
create.schema = createEntrySchema;

// update for user
const updateEntrySchema = {
  body: Joi.object().keys({
    calories: Joi.number().min(0).optional(),
    date: Joi.number().positive().optional(),
    time: Joi.number().min(0).max(1440).optional(),
    title: Joi.string().optional()
  }).or(entryFields)
};
function localUpdate(req, res, next) {
  updateUserEntry(req.user.id, req.params.entryId, _.pick(req.body, entryFields), res, next);
}
localUpdate.schema = _.merge({
  params: {
    entryId: Joi.string().required()
  }
}, updateEntrySchema);

// update for admin
function update(req, res, next) {
  updateUserEntry(req.params.userId, req.params.entryId, _.pick(req.body, entryFields), res, next);
}
update.schema = _.merge({
  params: {
    entryId: Joi.string().required(),
    userId: Joi.string().required()
  }
}, updateEntrySchema);

// read/list
const listSchema = {
  query: {
    page: Joi.number().min(0).required(),
    limit: Joi.number().min(1).max(10).required(),
    fromDate: Joi.number(),
    toDate: Joi.number(),
    fromTime: Joi.number(),
    toTime: Joi.number()
  }
};
function localList(req, res, next) {
  const data = _.pick(req.query, Object.keys(localList.schema.query));
  data.sort = '-date -time'
  paginateUserEntries(req.user.id, data, res, next);
}
localList.schema = listSchema;
function list(req, res, next) {
  const data = _.pick(req.query, Object.keys(localList.schema.query));
  data.sort = '-date -time'
  paginateUserEntries(req.params.userId, data, res, next);
}
list.schema = listSchema;

function localGet(req, res, next) {
  return entryService.findUserEntry(req.user.id, req.params.entryId).then(function(entry) {
    res.json(entry)
  }).catch(next);
}
localGet.schema = {
  params: {
    entryId: Joi.string().required()
  }
};

// delete
function localRemove(req, res, next) {
  removeUserEntry(req.user.id, req.params.entryId, res, next);
}
localRemove.schema = {
  params: {
    entryId: Joi.string().required()
  }
};
function remove(req, res, next) {
  removeUserEntry(req.params.userId, req.params.entryId, res, next);
}
remove.schema = {
  params: {
    userId: Joi.string().required(),
    entryId: Joi.string().required()
  }
};

// other
function currentUserDailyCaloricIntake(req, res, next) {
  const userId = req.user.id;
  const today = parseInt(moment().format('YYYYMMDD'), 10);

  entryService.calculateUserDailyCaloricIntake(userId, today).then(data => res.json(data)).catch(next);
}

module.exports = {
  localCreate,
  localGet,
  localList,
  localUpdate,
  localRemove,
  create,
  list,
  update,
  remove,
  currentUserDailyCaloricIntake
};

