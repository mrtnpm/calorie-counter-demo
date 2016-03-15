import React from 'react'
import { Route, IndexRedirect, browserHistory } from 'react-router'
import { push } from 'react-router-redux'

import LoginForm from 'views/LoginForm'
import UserRegisterForm from 'views/UserRegisterForm'
import UserCreateForm from 'views/UserCreateForm'
import ConnectedEntryList from 'views/ConnectedEntryList'
import ConnectedUserList from 'views/ConnectedUserList'
import EntryEditForm from 'views/EntryEditForm'
import EntryCreateForm from 'views/EntryCreateForm'
import UserEditForm from 'views/UserEditForm'
import ManagerUserEditForm from 'views/ManagerUserEditForm'
import ConnectedCoreLayout from 'views/ConnectedCoreLayout'

import { requestProfile } from 'redux/modules/auth'


export default (store) => {
  if(!store.getState().auth.isAuthenticated) {
    store.dispatch(push('/login'))
  }

  const ensureIsManager = (nextstate, replace) => {
    if(store.getState().auth.user.role != 'ENTITY_ROLE_MANAGER') {
      store.dispatch(push('/'))
    }
  }

  var profilePromise;
  const onIndexEnter = (nextstate, replace, callback) => {
    const auth = store.getState().auth;
    if(!auth.isAuthenticated) {
      callback()
      replace('/login');
      return
    }
    else if (!auth.user._id && !auth.isAuthenticating){
      profilePromise = store.dispatch(requestProfile())
      profilePromise.then(() => {
        callback()
      })
      return
    }
    else if (auth.isAuthenticating) {
      profilePromise.then(() => {
        callback()
      })
      return
    }
    callback();
  }

  return(
    <Route path='/' onEnter={onIndexEnter} component={ConnectedCoreLayout} >
      <IndexRedirect to="entries" />
      <Route path="profile" component={UserEditForm} />
      <Route path="login" component={LoginForm}/>
      <Route path="register" component={UserRegisterForm} />
      <Route path="entries" component={ConnectedEntryList} />
      <Route path="users" onEnter={ensureIsManager} component={ConnectedUserList} />
      <Route path="users/new" onEnter={ensureIsManager} component={UserCreateForm} />
      <Route path="users/:userId" onEnter={ensureIsManager} component={ManagerUserEditForm} />
      <Route path="entries/new"  component={EntryCreateForm} />
      <Route path="entries/:entryId" component={EntryEditForm} />
    </Route>
  )
}