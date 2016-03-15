import React, { Component, PropTypes } from 'react'
import { Button } from 'elemental'
import { Link } from 'react-router'

import '../styles/core.scss'
import '!style!css!less!../../vendor/less/elemental.less'


class CoreLayout extends Component {
  render() {
    const { children, isLoggedIn, isManager, onLogoutClick, username } = this.props;

    return (
      <div className='page-container'>
          <div className='container'>
            <div className="row">
              <nav className="text-left col-sm-12">
                {(() => (
                  username ? <span><b>Welcome {username}!</b></span> : undefined
                ))()}{' '}
                {(() => (
                  isLoggedIn ? <a href='javascript:void(0);' onClick={onLogoutClick}>Logout</a> : undefined
                ))()}
                {(() => (
                  isLoggedIn ? <Link to={'/entries'} activeStyle={{textDecoration: 'underline'}}>View Entries</Link> : undefined
                ))()}
                {(() => (
                  isLoggedIn && isManager ? <Link to={'/users'} activeStyle={{textDecoration: 'underline'}}>Manage Users</Link> : undefined
                ))()}
                {(() => (
                  isLoggedIn ? <Link to={'/profile'} activeStyle={{textDecoration: 'underline'}}>Manage Profile</Link> : undefined
                ))()}
              </nav>
            </div>
          </div>
        { children }
      </div>
    );
  }
}

export default CoreLayout
