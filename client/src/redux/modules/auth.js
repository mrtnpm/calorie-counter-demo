import { createAction, handleAction, handleActions } from 'redux-actions';
import req from 'utils/http'
import { push } from 'react-router-redux'
import { entriesClear } from './entries'

function login({ username, password }) {
  return req.post('/api/login').send({ username, password })
}
function logout() {
  return req.get('/api/logout')
}
function profile() {
  return req.get('/api/me')
}
function update(data) {
  return req.put('/api/me').send(data)
}

const PROFILE_UPDATE_REQUEST = 'PROFILE_UPDATE_REQUEST';
const PROFILE_UPDATE_SUCCESS = 'PROFILE_UPDATE_SUCCESS';
const PROFILE_UPDATE_ERROR = 'PROFILE_UPDATE_ERROR';
const profileUpdateRequest = createAction(PROFILE_UPDATE_REQUEST)
const profileUpdateSuccess = createAction(PROFILE_UPDATE_SUCCESS, (res) => res.body)
const profileUpdateError = createAction(PROFILE_UPDATE_ERROR)
export const updateProfile = (data) => {
  return (dispatch, getState) => {
    dispatch(profileUpdateRequest(data));
    return update(data).then(
      user => dispatch(profileUpdateSuccess(user)),
      error => dispatch(profileUpdateError(error))
    )
  }
}

const PROFILE_REQUEST = 'PROFILE_REQUEST';
const PROFILE_SUCCESS = 'PROFILE_SUCCESS';
const PROFILE_ERROR = 'PROFILE_ERROR';
const profileRequest = createAction(PROFILE_REQUEST)
const profileSuccess = createAction(PROFILE_SUCCESS, (res) => res.body)
const profileError = createAction(PROFILE_ERROR)
export const requestProfile = () => {
  return (dispatch, getState) => {
    dispatch(profileRequest());
    return profile().then(
      user => dispatch(profileSuccess(user)),
      error => dispatch(profileError(error))
    )
  }
}

const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
const LOGIN_ERROR = 'LOGIN_ERROR';
const LOGOUT_SUBMIT = 'LOGOUT_SUBMIT';
const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
const loginRequest = createAction(LOGIN_REQUEST)
export const loginSuccess = createAction(LOGIN_SUCCESS, (res) => res.body)
const loginError = createAction(LOGIN_ERROR)
const loginSubmit = createAction(LOGIN_SUBMIT);

export const submitLogin = ({username, password}) => {
  return (dispatch) => {
    const payload = { username, password };
    dispatch(loginRequest(payload));
    dispatch(loginSubmit(payload));

    return login(payload).then(
      user => dispatch(loginSuccess(user)) && dispatch(push('/entries')),
      error => dispatch(loginError(error))
    );
  }
};

const logoutSuccess = createAction(LOGOUT_SUCCESS);
const logoutSubmit = createAction(LOGOUT_SUBMIT);
export const submitLogout = () => {
  return (dispatch) => {
    dispatch(logoutSubmit());
    return logout().then(
      user => dispatch(logoutSuccess()) && dispatch(entriesClear()) && dispatch(push('/login'))
    );
  }
};

const authReducer = (isInitiallyAuthenticated = false) => {
  const authReducerInitialState = {
    user: {
      expectedDailyCalories: 0,
      role: 'ENTITY_ROLE_USER',
      username: ''
    }, isAuthenticated: isInitiallyAuthenticated, isAuthenticating: false, authenticationError: null
  }

  return handleActions({
    [PROFILE_REQUEST]: (state, action) => ({
      ...state,
      isAuthenticating: true
    }),
    [PROFILE_SUCCESS]: (state, action) => ({
      ...state,
      user: action.payload,
      isAuthenticating: false
    }),
    [PROFILE_ERROR]: (state, action) => ({
      ...state,
      isAuthenticating: false,
      authenticationError: action.payload.message
    }),

    [LOGIN_SUBMIT]: (state, action) => ({
      ...state,
      isAuthenticating: true
    }),

    [LOGIN_REQUEST]: (state, action) => ({
      ...state,
      isAuthenticating: true,
    }),

    [LOGIN_SUCCESS]: (state, action) => {
      return {
        isAuthenticated: true,
        isAuthenticating: false,
        user: action.payload
      }
    },
    [LOGIN_ERROR]: (state, action) => ({
      ...state,
      isAuthenticating: false,
      authenticationError: action.payload.message
    }),

    [LOGOUT_SUCCESS]: (state, action) => ({
      ...state,
      user: {},
      isAuthenticated: false
    })
  }, authReducerInitialState);
}

export default authReducer;