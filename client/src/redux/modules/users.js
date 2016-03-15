import { createAction, handleAction, handleActions } from 'redux-actions';
import req from 'utils/http'
import moment from 'moment'

function get(userId) {
  return req.get(`/api/users/${userId}`)
}
function list(pagingData = { page: 1, limit: 10 }) {
  return req.get(`/api/users?page=${pagingData.page}&limit=${pagingData.limit}`)
}
function create(data) {
  data.role = "ENTITY_ROLE_USER"
  return req.post('/api/users').send(data);
}
function update(userId, data) {
  return req.put(`/api/users/${userId}`).send(data)
}
function remove(userId) {
  return req.del(`/api/users/${userId}`).send();
}

const USER_REQUEST_SUCCESS = 'USER_REQUEST_SUCCESS'
const requestSuccess = createAction(USER_REQUEST_SUCCESS);
export const requestUser = (userId) => {
  return (dispatch) => {
    return get(userId).then((res) => dispatch(requestSuccess(res.body)))
  }
}

const USER_CREATE_SUCCESS = 'USER_CREATE_SUCCESS'
const createSuccess = createAction(USER_CREATE_SUCCESS);
export const createUser = (data) => {
  return (dispatch) => {
    return create(data).then((res) => dispatch(createSuccess(res.body)))
  }
}
const USER_REMOVE_SUCCESS = 'USER_REMOVE_SUCCESS'
const removeSuccess = createAction(USER_REMOVE_SUCCESS);
export const removeUser = (userId) => {
  return (dispatch) => {
    return remove(userId).then(() => dispatch(removeSuccess(userId)))
  }
}
const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS'
const updateSuccess = createAction(USER_UPDATE_SUCCESS);
export const updateUser = (data) => {
  return (dispatch, getState) => {
    return update(getState().users.user._id, data).then(() => dispatch(updateSuccess()))
  }
}

const USERS_PAGE_UPDATE = 'ENTRIES_PAGE_UPDATE'
export const usersPageUpdate = createAction(USERS_PAGE_UPDATE)

const USERS_LIST_SUCCESS = 'USERS_LIST_SUCCESS'
const usersListSuccess = createAction(USERS_LIST_SUCCESS, (res) => res.body);
export const requestUsers = () => {
  return (dispatch, getState) => {
    const pagingData = getState().users.pagingData;
    return list(pagingData).then(
      result => dispatch(usersListSuccess(result))
    )
  }
}

const usersReducerInitialState = { users: [], pagingData: { page: 1, limit: 5, total: 0 }, isLoading: false, user: {} };
const usersReducer = handleActions({
  [USER_REQUEST_SUCCESS]: (state, action) => ({
    ...state,
    user: action.payload
  }),
  [USER_REMOVE_SUCCESS]: (state, action) => ({
    ...state,
    users: state.users.filter((user) => (user._id !== action.payload))
  }),
  [USERS_LIST_SUCCESS]: (state, action) => ({
    ...state,
    users: action.payload.docs,
    pagingData: {
      page: action.payload.page || 1,
      limit: action.payload.limit,
      total: action.payload.total
    },
    isLoading: false
  }),
  [USERS_PAGE_UPDATE]: (state, action) => {
    const pagingData = {
      page: action.payload,
      limit: state.pagingData.limit,
      total: state.pagingData.total
    }
    return {
      ...state,
      pagingData
    }
  },
}, usersReducerInitialState);

export default usersReducer;