import { reduxForm } from 'redux-form';
import { push } from 'react-router-redux'

import CreateUser from 'components/CreateUser'
import SmallLayout from 'layouts/SmallLayout'
import { exists } from 'redux/modules/register'
import { createUser } from 'redux/modules/users'
import { formSchemaValidationFor } from 'utils/validation'


const registerAsyncValidation = (values) => {
  return new Promise((resolve, reject) => {
    exists(values.username).then((result) => {
      result.body.exists ? reject({ username: 'The username already exists.'}) : resolve();
    }, () => {
      reject({ username: 'Could not verify the username uniqueness.' })
    })
  });
}

const reduxFormConfig = {
  form: 'createUser',
  fields: Object.keys(CreateUser.schema),
  asyncValidate: registerAsyncValidation,
  asyncBlurFields: ['username'],
  validate: formSchemaValidationFor(CreateUser.schema)
};

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (data) => (dispatch(createUser(data)).then(() => dispatch(push('/users'))))
  }
}

module.exports = reduxForm(reduxFormConfig, null, mapDispatchToProps)(SmallLayout(CreateUser));