const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const ROLES = require('./roles');

const userSchema = new mongoose.Schema({
  expectedDailyCalories: { type: Number, required: true, default: 0 },
  password: { type: String, required: true },
  role: { type: String, enum: ROLES.values, required: true, default: ROLES.ENTITY_ROLE_USER },
  username: { type: String, index: { unique: true } }
});
userSchema.plugin(mongoosePaginate);

userSchema.pre('save', function saltAndHashPasswordIfModified(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, (genErr, salt) => {
    if (genErr) return next(genErr);
    bcrypt.hash(user.password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
