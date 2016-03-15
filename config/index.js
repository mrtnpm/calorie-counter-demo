const path = require('path');
const extend = require('util')._extend;

const development = require('./env/development');
const test = require('./env/test');
const production = require('./env/production');

const defaults = {
  root: path.join(__dirname, '..', 'server'),
  session: {
    secret: '!@##TR@YRJHTMRHGADSFREWYU%$#QEWFGDSGT!#%!#%'
  },
  cookie: {
    secret: '!@##TR@&*GUOA)KJ{PO(I*%$#QEWFGDSGT!#%!#%'
  }
};

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
