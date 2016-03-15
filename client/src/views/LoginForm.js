import { reduxForm } from 'redux-form';
import { push } from 'react-router-redux'

import Login from 'components/Login'
import SmallLayout from 'layouts/SmallLayout'
import { submitLogin } from 'redux/modules/auth'
import { formSchemaValidationFor } from 'utils/validation'

const reduxFormConfig = {
  form: 'login',
  fields: Object.keys(Login.schema),
  validate: formSchemaValidationFor(Login.schema)
};

function mapStateToProps(state) {
  return {
    isAuthenticating: state.auth.isAuthenticating,
    authenticationError: state.auth.authenticationError
  }
};

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (data) => (dispatch(submitLogin(data))),
    onGoToRegisterClick: () => (dispatch(push('/register')))
  }
}

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(SmallLayout(Login));