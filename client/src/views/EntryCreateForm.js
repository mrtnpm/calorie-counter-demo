import { reduxForm } from 'redux-form';
import { goBack } from 'react-router-redux'
import moment from 'moment'
import { provideHooks } from 'redial'

import EntryEdit from 'components/EntryEdit'
import SmallLayout from 'layouts/SmallLayout'
import { formSchemaValidationFor } from 'utils/validation'
import { entryCreate, entryCreateDateInit } from 'redux/modules/entry'

const reduxFormConfig = {
  form: 'entry',
  fields: Object.keys(EntryEdit.schema),
  validate: formSchemaValidationFor(EntryEdit.schema)
};

function mapStateToProps(state) {
  return {
    initialValues: {
      title: '',
      calories: 0,
      date: state.entry.newEntryDate
    }
  }
};

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (data) => {
      const date = moment(data.date);
      const payload = {
        date: date.format('YYYYMMDD'),
        time: date.hours()*60+date.minutes(),
        title: data.title,
        calories: data.calories
      }
      return (dispatch(entryCreate(payload))).done(()=> dispatch(goBack()))
    }
  }
}

const EntryCreateFormWithData = provideHooks({
  fetch: ({ dispatch }) => dispatch(entryCreateDateInit())
})(class EntryEditForm extends SmallLayout(EntryEdit) {});

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(EntryCreateFormWithData);