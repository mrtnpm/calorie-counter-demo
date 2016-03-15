import { reduxForm } from 'redux-form';
import { push } from 'react-router-redux'

import Register from 'components/Register'
import SmallLayout from 'layouts/SmallLayout'
import { exists, registerSubmit } from 'redux/modules/register'
import { formSchemaValidationFor } from 'utils/validation'


const registerAsyncValidation = (values) => {
  return new Promise((resolve, reject) => {
    exists(values.username).then((result) => {
      result.body.exists ? reject({ username: 'The username already exists.'}) : resolve();
    }, (err) => {
      reject({ username: 'Could not verify the username uniqueness.' })
    })
  });
}

const registerSchema = Register.schema;
const reduxFormConfig = {
  form: 'register',
  fields: Object.keys(registerSchema),
  asyncValidate: registerAsyncValidation,
  asyncBlurFields: ['username'],
  validate: formSchemaValidationFor(registerSchema)
};

function mapStateToProps(state) {
  return {
    registrationError: state.register.registrationError
  }
};

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (data) => (dispatch(registerSubmit(data))),
    onGoToLoginClick: () => (dispatch(push('/login')))
  }
}

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(SmallLayout(Register));