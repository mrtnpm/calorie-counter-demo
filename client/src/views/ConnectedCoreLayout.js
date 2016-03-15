import { connect } from 'react-redux'
import CoreLayout from 'layouts/CoreLayout'
import { submitLogout } from 'redux/modules/auth'

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isAuthenticated,
    isManager: state.auth.user.role == 'ENTITY_ROLE_MANAGER',
    username: state.auth.user.username
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onLogoutClick: () => (dispatch(submitLogout()))
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(CoreLayout);