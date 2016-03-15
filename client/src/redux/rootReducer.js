import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'
import cookies from 'browser-cookies'

import auth from 'redux/modules/auth'
import register from 'redux/modules/register'
import entries from 'redux/modules/entries'
import entry from 'redux/modules/entry'
import users from 'redux/modules/users'

export default combineReducers({
  router,
  auth: auth(cookies.get('authenticated') === 'true'),
  entries,
  entry,
  register,
  users,
  form: formReducer
})