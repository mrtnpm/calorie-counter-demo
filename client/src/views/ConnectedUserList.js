import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { provideHooks } from 'redial'
import StandardLayout from 'layouts/StandardLayout'

import UserList from 'components/UserList'
import { requestUsers, removeUser, usersPageUpdate } from 'redux/modules/users'
import { formSchemaValidationFor } from 'utils/validation'
import { entriesRequest, entriesPageUpdate, entriesDeleteRequest, entriesUpdateRequest,
  entriesFiltersUpdate, entriesFiltersClear, entriesDailyCaloricIntake } from 'redux/modules/entries'

function mapStateToProps(state) {
  return {
    users: state.users.users,
    pagingData: state.users.pagingData
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onAddNewUserClick: () => (dispatch(push('/users/new'))),
    handlePageSelect: (page) => (dispatch(usersPageUpdate(page)) && dispatch(requestUsers())),
    handleDeleteClick: (userId) => (dispatch(removeUser(userId))),
    handleEditClick: (userId) => (dispatch(push(`/users/${userId}`)))
  }
}

const UserListWithData = provideHooks({
  fetch: ({ dispatch }) => dispatch(requestUsers())
})(StandardLayout(UserList))

module.exports = connect(mapStateToProps, mapDispatchToProps)(UserListWithData);