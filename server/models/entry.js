const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const entrySchema = new mongoose.Schema({
  calories: { type: Number, required: true, default: 0 },
  date: { type: Number, required: true, default: 19860825 },
  time: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: 'Meal' },
  user: { type: String, required: true, ref: 'User' }
});
entrySchema.plugin(mongoosePaginate);

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
