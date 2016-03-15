const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const mongoose = require('mongoose');
const User = mongoose.models.User;
const ObjectId = mongoose.Types.ObjectId;

function paginateUsersByRoles(roles, pagingData) {
  return User.paginate({ role: { $in: roles } }, pagingData);
}

function findById(userId) {
  return User.findOne({ _id: new ObjectId(userId) }).exec();
}

function findByUsername(username) {
  return User.findOne({ username }).exec();
}

function remove(userId) {
  return User.findOneAndRemove({ _id: new ObjectId(userId) }).exec();
}

function updateUserWithRoles(userId, roles, data) {
  if(data.password) {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(SALT_WORK_FACTOR, (genErr, salt) => {
        if (genErr) return reject(genErr);
        bcrypt.hash(data.password, salt, (hashErr, hash) => {
          if (hashErr) return reject(hashErr);

          data.password = hash;
          const update = User.findOneAndUpdate({
            _id: new ObjectId(userId),
            role: { $in: roles }
          }, data, { new: true }).exec()

          resolve(update)
        });
      });
    });
  }

  return User.findOneAndUpdate({
    _id: new ObjectId(userId),
    role: { $in: roles }
  }, data, { new: true }).exec();
}

function create(username, password, role, expectedDailyCalories) {
  return new User({ expectedDailyCalories, password, username, role }).save();
}

module.exports = {
  paginateUsersByRoles,
  findById,
  findByUsername,
  remove,
  updateUserWithRoles,
  create
};
