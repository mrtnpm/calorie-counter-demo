import React, { Component, PropTypes } from 'react';
import { Button, Form, FormField, FormInput, FormRow } from 'elemental'
import moment from 'moment'

import 'react-widgets/lib/less/react-widgets.less'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import Globalize from 'globalize'
import globalizeLocalizer from 'react-widgets/lib/localizers/globalize'

import Joi from 'joi-browser'
import classnames from 'classnames'

globalizeLocalizer(Globalize)

export default class EntryEdit extends React.Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  }
  static schema = {
    title: Joi.string().required(),
    calories: Joi.number().min(0).required(),
    date: Joi.date().required()
  }
  render() {
    const { fields: { title, calories }, handleSubmit, editError, submitting, errors } = this.props;
    const initialDate = this.props.fields.date;
    const date = {
      ...initialDate,
      initialValue: moment(initialDate.initialValue || new Date()).toDate(),
      defaultValue: moment(initialDate.defaultValue || new Date()).toDate(),
      value: moment(initialDate.value || new Date()).toDate()
    }

    return (
      <Form onSubmit={handleSubmit} className={classnames({'is-invalid': Object.keys(errors).length || editError })} >
        <FormField label='Title' htmlFor='title'>
          <FormInput type='text' placeholder='Title' { ...title } />
          {title.touched && title.error && <div className='form-validation is-invalid'>{title.error}</div>}
        </FormField>
        <FormField label='Calories' htmlFor='calories'>
          <FormInput type='number' placeholder='Calories' { ...calories } />
          {calories.touched && calories.error && <div className='form-validation is-invalid'>{calories.error}</div>}
        </FormField>
        <FormField label='Date and Time' htmlFor='date'>
          <DateTimePicker {...date}></DateTimePicker>
          {date.touched && date.error && <div className='form-validation is-invalid'>{date.error}</div>}
        </FormField>
        {(() => {
          if(editError)
            return <FormField><div className="form-validation is-invalid">There was an error registering you, try again later.</div></FormField>
        })()}
        <div className="text-right">
          <Button submit disabled={submitting}>
            {submitting ? <i/> : <i/>} SAVE
          </Button>
        </div>
      </Form>
    )
  }
}
