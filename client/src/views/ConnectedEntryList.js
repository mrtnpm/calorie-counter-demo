import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { provideHooks } from 'redial'
import StandardLayout from 'layouts/StandardLayout'

import EntryList from 'components/EntryList'
import { submitLogin } from 'redux/modules/auth'
import { formSchemaValidationFor } from 'utils/validation'
import { entriesRequest, entriesPageUpdate, entriesDeleteRequest, entriesUpdateRequest,
  entriesFiltersUpdate, entriesFiltersClear, entriesDailyCaloricIntake } from 'redux/modules/entries'

function mapStateToProps(state) {
  return {
    entries: state.entries.entries,
    filters: state.entries.filters,
    pagingData: state.entries.pagingData,
    dailyCaloricIntake: state.entries.dailyCaloricIntake,
    expectedDailyCalories: state.auth.user.expectedDailyCalories
  }
}

function mapDispatchToProps(dispatch) {
  return {
    handlePageSelect: (page) => (dispatch(entriesPageUpdate(page)) && dispatch(entriesRequest())),
    handleDeleteClick: (entryId) => (dispatch(entriesDeleteRequest(entryId)).then(() => dispatch(entriesDailyCaloricIntake()))),
    onClearFilterClick: () => (dispatch(entriesFiltersClear()) && dispatch(entriesRequest())),
    onFilterClick: (newFilters) => (dispatch(entriesFiltersUpdate(newFilters)) &&  dispatch(entriesRequest())),
    onAddEntryClick: () => (dispatch(push('/entries/new'))),
    handleEditClick: (entryId) => (dispatch(push(`/entries/${entryId}`)))
  }
}

const EntryListWithData = provideHooks({
  fetch: ({ dispatch }) => Promise.all([dispatch(entriesRequest()), dispatch(entriesDailyCaloricIntake())])
})(StandardLayout(EntryList))

module.exports = connect(mapStateToProps, mapDispatchToProps)(EntryListWithData);
