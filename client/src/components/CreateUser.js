import React, { Component, PropTypes } from 'react';
import { Button, Form, FormField, FormInput, FormRow } from 'elemental'
import Joi from 'joi-browser'
import classnames from 'classnames'

export default class CreateUser extends React.Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  }
  static schema = {
    username: Joi.string().min(6).max(15).required(),
    password: Joi.string().min(8).max(30).required(),
    expectedDailyCalories: Joi.number().min(0).required()
  }

  render () {
    const { fields: { username, password, expectedDailyCalories }, handleSubmit, submitting, errors } = this.props;
    return (
      <Form onSubmit={handleSubmit} className={classnames({'is-invalid': Object.keys(errors).length })} >
        <FormField label='Username' htmlFor='username'>
          <FormInput type='text' placeholder='Enter email' { ...username } />
          {username.touched && username.error && <div className='form-validation is-invalid'>{username.error}</div>}
        </FormField>
        <FormField label='Password' htmlFor='password'>
          <FormInput type='password' placeholder='Password' { ...password } />
          {password.touched && password.error && <div className='form-validation is-invalid'>{password.error}</div>}
        </FormField>
        <FormField label='Expected Daily Calories' htmlFor='expectedDailyCalories'>
          <FormInput type='number' placeholder='Expected Daily Calories' {...expectedDailyCalories} />
          {expectedDailyCalories.touched && expectedDailyCalories.error && <div className='form-validation is-invalid'>{expectedDailyCalories.error}</div>}
        </FormField>
        <div className="text-right">
          <Button submit disabled={submitting}>
            {submitting ? <i/> : <i/>} Submit
          </Button>
        </div>
      </Form>
    )
  }
}
