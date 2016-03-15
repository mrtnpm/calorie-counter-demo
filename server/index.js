const config = require('../config');
const mongoose = require('mongoose');
const passport = require('passport');
const express = require('express');

const fs = require('fs');
const join = require('path').join;
const models = join(__dirname, 'models');
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(join(models, file)));

const port = process.env.PORT || 4000;
const app = express();

require('./config/passport')(passport);
require('./config/express')(app, passport, config);
require('./config/routes')(app);

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', () => {
    if (app.get('env') === 'test') return;
    app.listen(port);
    console.log(`Express app started on port ${port}`);
  });

function connect() {
  return mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } }).connection;
}

module.exports = app;