import superagent from 'superagent'
import request from 'superagent-promise'
import Promise from 'promise'

module.exports = request(superagent, Promise);