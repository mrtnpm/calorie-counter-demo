import React, { Component } from 'react'
import moment from 'moment'
import { Button, Form, FormField, FormInput, FormRow } from 'elemental'

import Joi from 'joi-browser'
import classnames from 'classnames'

export default class UserEdit extends Component {
  static schema = {
    password: Joi.string().min(8).max(30).optional(),
    expectedDailyCalories: Joi.number().min(0).optional()
  }
  render() {
    const { fields: { password, expectedDailyCalories }, username, handleSubmit, onCancelClick, updateError, submitting, errors } = this.props;
    return (
      <Form onSubmit={handleSubmit} className={classnames({'is-invalid': Object.keys(errors).length || updateError })} >
        <FormField>
          {(() => {
            if(username)
              return <div><b>User:</b> { username }</div>
          })()}
        </FormField>
        <FormField label='Password' htmlFor='password'>
          <FormInput type='password' placeholder='Password' { ...password } />
          {password.touched && password.error && <div className='form-validation is-invalid'>{password.error}</div>}
        </FormField>
        <FormField label='Expected Daily Calories' htmlFor='expectedDailyCalories'>
          <FormInput type='number' placeholder='Expected Daily Calories' {...expectedDailyCalories} />
          {expectedDailyCalories.touched && expectedDailyCalories.error && <div className='form-validation is-invalid'>{expectedDailyCalories.error}</div>}
        </FormField>
        {(() => {
          if(updateError)
            return <FormField><div className="form-validation is-invalid">There was an updating, try again later.</div></FormField>
        })()}
        <div className="text-right">
          <Button disabled={submitting} onClick={ onCancelClick }>
            CANCEL
          </Button>{' '}
          <Button submit disabled={submitting}>
            {submitting ? <i/> : <i/>} Submit
          </Button>
        </div>
      </Form>
    )
  }
}
