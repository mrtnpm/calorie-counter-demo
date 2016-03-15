const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Entry = mongoose.models.Entry;

function paginateUserEntries(userId, data) {
  const pagination = { limit: data.limit, page: data.page, sort: data.sort }
  const query = {
    user: userId,
  }

  if(data.fromDate || data.toDate) {
    query.date = {}
  }
  if(data.fromDate) {
    query.date['$gte'] = data.fromDate
  }
  if(data.toDate) {
    query.date['$lte'] = data.toDate
  }

  if(data.fromTime || data.toTime) {
    query.time = {}
  }
  if(data.fromTime) {
    query.time['$gte'] = data.fromTime
  }
  if(data.toTime) {
    query.time['$lte'] = data.toTime
  }

  return Entry.paginate(query, pagination);
}
function findUserEntry(userId, entryId) {
  return Entry.findOne({ user: userId, _id: ObjectId(entryId) }).exec();
}
function calculateUserDailyCaloricIntake(userId, date) {
  return Entry.aggregate([{
    $match: {
      user: userId,
      date
    }
  }, {
    $group: {
      _id: null,
      total: {
        $sum: '$calories'
      }
    }
  }, {
    $project: {
      _id: false,
      total: true
    }
  }]).exec().then((data) => ({ total: data.length ? data[0].total : 0 }));
}
function remove(userId, entryId) {
  const id = new ObjectId(entryId);
  return Entry.findOneAndRemove({ user: userId, _id: id }).exec();
}
function update(userId, entryId, data) {
  const id = new ObjectId(entryId);
  return Entry.findOneAndUpdate({ user: userId, _id: id }, data, { new: true }).exec();
}
function create(userId, calories, date, time, title) {
  return new Entry({ user: userId, calories, date, time, title }).save();
}

module.exports = {
  calculateUserDailyCaloricIntake,
  paginateUserEntries,
  findUserEntry,
  create,
  remove,
  update
};
