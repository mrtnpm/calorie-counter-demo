import React, { Component } from 'react'
import { Button } from 'elemental'

export default class User extends Component {
  editClick() {
    this.props.onEditClick(this.props.user._id);
  }
  deleteClick() {
    this.props.onDeleteClick(this.props.user._id);
  }
  render() {
    const { user: { username, expectedDailyCalories, _id } } = this.props;
    return (
      <article className="user">
        <dl>
          <dt>ID</dt>
          <dd>{_id}</dd>
          <dt>Username</dt>
          <dd>{username}</dd>
          <dt>Expected Daily Calories</dt>
          <dd>{expectedDailyCalories}</dd>
        </dl>
        <div className="text-right">
          <Button onClick={this.editClick.bind(this)}>Edit</Button>{' '}
          <Button onClick={this.deleteClick.bind(this)}>Delete</Button>
        </div>
      </article>
    )
  }
}
