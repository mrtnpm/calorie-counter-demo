import React, { Component } from 'react'
import moment from 'moment'
import { Button } from 'elemental'


export default class Entry extends Component {
  deleteClick() {
    this.props.onDeleteClick(this.props.entry._id);
  }
  editClick() {
    this.props.onEditClick(this.props.entry._id);
  }
  render() {
    const { calories, title, date, time, _id } = this.props.entry;
    const datetime = moment(date, "YYYYMMDD").add('minutes', time).format('MM/DD/YY @ hh:mma');
    return (
      <article className="entry">
        <h4>{datetime} - {title}</h4>
        <div>{calories} calories</div>
        <div>{_id}</div>
        <div className="text-right">
          <Button onClick={this.deleteClick.bind(this)}>Delete</Button>{' '}
          <Button onClick={this.editClick.bind(this)}>Edit</Button>
        </div>
      </article>
    )
  }
}
