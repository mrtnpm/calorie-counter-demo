import { reduxForm } from 'redux-form';
import { goBack } from 'react-router-redux'

import UserEdit from 'components/UserEdit'
import SmallLayout from 'layouts/SmallLayout'
import { requestProfile, updateProfile } from 'redux/modules/auth'
import { createUser } from 'redux/modules/users'
import { formSchemaValidationFor } from 'utils/validation'


const reduxFormConfig = {
  form: 'user',
  fields: Object.keys(UserEdit.schema),
  validate: formSchemaValidationFor(UserEdit.schema)
};

function mapStateToProps(state) {
 return {
   initialValues: state.auth.user
 };
}

function mapDispatchToProps(dispatch) {
  return {
    onCancelClick: () => dispatch(goBack()),
    onSubmit: (data) => {
      return (dispatch(updateProfile(data))).done(()=> (dispatch(requestProfile()) && dispatch(goBack())))
    }
  }
}

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(class UserEditForm extends SmallLayout(UserEdit) {});