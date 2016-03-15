import { reduxForm } from 'redux-form';
import { provideHooks } from 'redial'
import { goBack } from 'react-router-redux'

import UserEdit from 'components/UserEdit'
import SmallLayout from 'layouts/SmallLayout'
import { updateUser, requestUser } from 'redux/modules/users'
import { createUser } from 'redux/modules/users'
import { formSchemaValidationFor } from 'utils/validation'


const reduxFormConfig = {
  form: 'user',
  fields: Object.keys(UserEdit.schema),
  validate: formSchemaValidationFor(UserEdit.schema)
};

function mapStateToProps(state) {
 return {
   initialValues: state.users.user, username: state.users.user.username
 };
}

function mapDispatchToProps(dispatch) {
  return {
    onCancelClick: () => dispatch(goBack()),
    onSubmit: (data) => {
      return (dispatch(updateUser(data))).done(()=> (dispatch(goBack())))
    }
  }
}

const UserEditFormWithData = provideHooks({
  fetch: ({ dispatch, params }) => {dispatch(requestUser(params.userId))}
})(class UserEditForm extends UserEdit {})

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(SmallLayout(UserEditFormWithData));