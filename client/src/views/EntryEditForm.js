import { reduxForm } from 'redux-form';
import { push, goBack } from 'react-router-redux'
import moment from 'moment'
import { provideHooks } from 'redial'

import EntryEdit from 'components/EntryEdit'
import SmallLayout from 'layouts/SmallLayout'
import { entryRequest } from 'redux/modules/entry'
import { entriesUpdateRequest } from 'redux/modules/entries'
import { formSchemaValidationFor } from 'utils/validation'

const entryEditSchema = EntryEdit.schema;
const reduxFormConfig = {
  form: 'entryEdit',
  fields: Object.keys(entryEditSchema),
  validate: formSchemaValidationFor(entryEditSchema)
};

function mapStateToProps(state) {
  const entry = state.entry.entry;

  return {
    initialValues: {
      date: moment(entry.date, "YYYYMMDD").add('minutes', entry.time).format(),
      title: entry.title,
      calories: entry.calories,
      id: entry._id,
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
      return (dispatch(entriesUpdateRequest(payload))).done(()=> dispatch(goBack()))
    }
  }
}

const EntryEditFormWithData = provideHooks({
  fetch: ({ dispatch, params }) => dispatch(entryRequest(params.entryId))
})(class EntryEditForm extends SmallLayout(EntryEdit) {});

module.exports = reduxForm(reduxFormConfig, mapStateToProps, mapDispatchToProps)(EntryEditFormWithData);