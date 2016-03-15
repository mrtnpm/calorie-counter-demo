import { createAction, handleAction, handleActions } from 'redux-actions';
import req from 'utils/http'

function entries(pagingData = { page: 1, limit: 10 }, filters) {
  const base = `/api/entries?page=${pagingData.page}&limit=${pagingData.limit}`
  const filter = Object.keys(filters).length ? Object.keys(filters).map(function(key) {
    return `${key}=${filters[key]}`
  }).join('&') : null;

  return req.get( filter ? `${base}&${filter}` : base).send(pagingData)
}
function remove(entryId) {
  return req.del(`/api/entries/${entryId}`)
}
function update(entryId, data) {
  return req.put(`/api/entries/${entryId}`).send(data)
}
function dailyCaloricIntake() {
  return req.get('/api/dailyCaloricIntake')
}

const ENTRIES_DAILY_CALORIC_INTAKE_SUCCESS = 'ENTRIES_DAILY_CALORIC_INTAKE_SUCCESS';
const caloricIntakeSuccess = createAction(ENTRIES_DAILY_CALORIC_INTAKE_SUCCESS);
export const entriesDailyCaloricIntake = () => {
  return (dispatch) => (dailyCaloricIntake().then((res) => dispatch(caloricIntakeSuccess(res.body.total))))
}

const ENTRIES_FILTERS_UPDATE = 'ENTRIES_FILTERS_UPDATE'
const ENTRIES_FILTERS_CLEAR = 'ENTRIES_FILTERS_CLEAR'
export const entriesFiltersUpdate = createAction(ENTRIES_FILTERS_UPDATE)
export const entriesFiltersClear = createAction(ENTRIES_FILTERS_CLEAR)

const ENTRIES_UPDATE_SUCCESS = 'ENTRIES_UPDATE_SUCCESS'
const entriesUpdateSuccess = createAction(ENTRIES_UPDATE_SUCCESS)
export const entriesUpdateRequest = (updateData) => {
  return (dispatch, getState) => {
    return update(getState().entry.entry._id, updateData).then(
      () => dispatch(entriesUpdateSuccess())
    )
  }
}

const ENTRIES_DELETE_SUCCESS = 'ENTRIES_DELETE_SUCCESS';
const entriesDeleteSuccess = createAction(ENTRIES_DELETE_SUCCESS)
export const entriesDeleteRequest = (entryId) => {
  return (dispatch) => {
    return remove(entryId).then(() => dispatch(entriesDeleteSuccess(entryId)))
  }
}

const ENTRIES_PAGE_UPDATE = 'ENTRIES_PAGE_UPDATE'
export const entriesPageUpdate = createAction(ENTRIES_PAGE_UPDATE)

const ENTRIES_LOAD = 'ENTRIES_LOAD'
const ENTRIES_SUCCESS = 'ENTRIES_SUCCESS';
const ENTRIES_ERROR = 'ENTRIES_ERROR';
const ENTRIES_CLEAR = 'ENTRIES_CLEAR';
const entriesLoad = createAction(ENTRIES_LOAD);
const entriesSuccess = createAction(ENTRIES_SUCCESS, (res) => res.body );
const entriesError = createAction(ENTRIES_ERROR)
export const entriesRequest = () => {
  return (dispatch, getState) => {
    const pagingData = getState().entries.pagingData;
    const filters = getState().entries.filters;
    dispatch(entriesLoad(pagingData, filters))
    return entries(pagingData, filters).then(
      result => dispatch(entriesSuccess(result)),
      error => dispatch(entriesError(error))
    )
  }
}
export const entriesClear = createAction(ENTRIES_CLEAR)

const entriesReducerInitialState = { dailyCaloricIntake: 0, entries: [], pagingData: { page: 1, limit: 5, total: 0 }, filters: {}, isLoading: false, entry: null };
const entriesReducer = handleActions({
  [ENTRIES_DAILY_CALORIC_INTAKE_SUCCESS]: (state, action) => ({ ...state, dailyCaloricIntake: action.payload }),
  [ENTRIES_FILTERS_CLEAR]: (state, action) => ({ ...state, filters: {}}),
  [ENTRIES_FILTERS_UPDATE]: (state, action) => ({ ...state, filters: action.payload}),
  [ENTRIES_PAGE_UPDATE]: (state, action) => {
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

  [ENTRIES_DELETE_SUCCESS]: (state, action) => ({
      ...state,
      entries: state.entries.filter((entry) => (entry._id !== action.payload))
  }),

  [ENTRIES_LOAD]: (state, action) => ({
    ...state,
    isLoading: true
  }),

  [ENTRIES_SUCCESS]: (state, action) => ({
    ...state,
    entries: action.payload.docs,
    pagingData: {
      page: action.payload.page || 1,
      limit: action.payload.limit,
      total: action.payload.total
    },
    isLoading: false
  }),

  [ENTRIES_ERROR]: (state, action) => ({
    ...state,
    isLoading: false
  }),
  [ENTRIES_CLEAR]: (state, action) => (entriesReducerInitialState)
}, entriesReducerInitialState);

export default entriesReducer;