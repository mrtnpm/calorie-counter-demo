import React, { Component, PropTypes } from 'react';
import { Button, Form, FormField, FormInput, FormRow } from 'elemental'
import Joi from 'joi-browser'
import classnames from 'classnames'

export default class Login extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    authenticationError: PropTypes.string,
    onGoToRegisterClick: PropTypes.func.isRequired
  }
  static schema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }

  render() {
    const { fields: { username, password }, handleSubmit, onGoToRegisterClick, submitting, authenticationError, errors } = this.props;
    return (
      <Form onSubmit={handleSubmit} className={classnames({'is-invalid': Object.keys(errors).length || authenticationError })} >
        <FormField label='Username' htmlFor='username'>
          <FormInput type='text' placeholder='Enter email' { ...username } />
          {username.touched && username.error && <div className='form-validation is-invalid'>{username.error}</div>}
        </FormField>
        <FormField label='Password' htmlFor='password'>
          <FormInput type='password' placeholder='Password' { ...password } />
          {password.touched && password.error && <div className='form-validation is-invalid'>{password.error}</div>}
        </FormField>
        {(() => {
          if(authenticationError)
            return <FormField><div className="form-validation is-invalid">The credentials you entered are invalid.</div></FormField>
        })()}
        <div className="text-right">
          <Button disabled={submitting} onClick={ onGoToRegisterClick }>
            Not registered? SIGNUP
          </Button>{' '}
          <Button submit disabled={submitting} >
            {submitting ? <i/> : <i/>} Submit
          </Button>
        </div>
      </Form>
    );
  }
}

