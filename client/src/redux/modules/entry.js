import { createAction, handleAction, handleActions } from 'redux-actions';
import req from 'utils/http'
import moment from 'moment'

function get(entryId) {
  return req.get(`/api/entries/${entryId}`)
}

function create(data) {
  return req.post('/api/entries').send(data);
}

const ENTRY_CREATE_DATE_INIT = 'ENTRY_CREATE_DATE_INIT';
export const entryCreateDateInit = createAction(ENTRY_CREATE_DATE_INIT);

const ENTRY_CREATE_REQUEST = 'ENTRY_CREATE_REQUEST'
const ENTRY_CREATE_SUCCESS = 'ENTRY_CREATE_SUCCESS'
const ENTRY_CREATE_ERROR = 'ENTRY_CREATE_ERROR'
const createRequest = createAction(ENTRY_CREATE_SUCCESS);
const createSuccess = createAction(ENTRY_CREATE_SUCCESS);
const createError = createAction(ENTRY_CREATE_SUCCESS);
export const entryCreate = (data) => {
  return (dispatch) => {
    dispatch(createRequest(data))
    return create(data).then((res) => dispatch(createSuccess(res.body)), (err) => dispatch(createError()))
  }
}

const ENTRY_LOADING = 'ENTRY_LOADING'
const ENTRY_SUCCESS = 'ENTRY_SUCCESS';
const ENTRY_ERROR = 'ENTRY_ERROR';
const entrySuccess = createAction(ENTRY_SUCCESS);
const entryError = createAction(ENTRY_ERROR);
export const entryRequest = (entryId) => {
  return (dispatch) => {
    get(entryId).then((res) => dispatch(entrySuccess(res.body)), (err) => dispatch(entryError()))
  }
}

const entryReducerInitialState = { entry: { title:'', date: 0, time: 0, calories: 0 }, newEntryDate: moment(new Date()).format(), isLoading: false };
const entryReducer = handleActions({
  [ENTRY_CREATE_DATE_INIT]: (state, action) => {
    return {
      ...state,
      newEntryDate: moment(new Date()).format()
    }
  },
  [ENTRY_LOADING]: (state, action) => {
    return {
      ...state,
      isLoading: true
    }
  },
  [ENTRY_SUCCESS]: (state, action) => {
    return {
      entry: action.payload,
      isLoading: false
    }
  },
  [ENTRY_ERROR]: (state, action) => {
    return {
      ...state,
      isLoading: false
    }
  }

}, entryReducerInitialState);

export default entryReducer;