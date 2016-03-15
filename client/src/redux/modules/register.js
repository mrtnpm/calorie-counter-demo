import { createAction, handleAction, handleActions } from 'redux-actions';
import req from 'utils/http'
import { push } from 'react-router-redux'
import { loginSuccess } from './auth'

export function exists(username) {
  return req.get(`/api/users/${username}/exists`)
}

const REGISTER_SUBMIT = 'REGISTER_SUBMIT';
const REGISTER_REQUEST = 'REGISTER_REQUEST';
const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
const REGISTER_ERROR = 'REGISTER_ERROR';
function register({ username, password, expectedDailyCalories }) {
  return req.post('/api/register').send({ username, password, expectedDailyCalories })
}
const registerRequest = createAction(REGISTER_REQUEST)
const registerSuccess  = createAction(REGISTER_SUCCESS, (res) => res.body )
const registerError  = createAction(REGISTER_ERROR)
export const registerSubmit = ({ username, password, expectedDailyCalories }) => {
  return (dispatch) => {
    const payload = { username, password, expectedDailyCalories }
    dispatch(registerRequest(payload))

    return register(payload).then(
      user => (dispatch(registerSuccess(user)) && dispatch(loginSuccess(user)) && dispatch(push('/entries'))),
      error => (dispatch(registerError(error)))
    );
  }
};

const registerReducer = handleActions({
  [REGISTER_REQUEST]: (state, action) => ({
    isRegistering: true,
  }),

  [REGISTER_SUCCESS]: (state, action) => ({
    isRegistering: false
  }),

  [REGISTER_ERROR]: (state, action) => ({
    isRegistering: false,
    registrationError: action.payload.message
  })
}, { isRegistering: false, registrationError: null });

export default registerReducer;