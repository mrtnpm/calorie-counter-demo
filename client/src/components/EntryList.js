import { Pagination } from 'elemental'
import React, { Component } from 'react';
import { Button, Form, FormField, FormInput, FormRow } from 'elemental'
import Entry from './Entry'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import moment from 'moment'
import classnames from 'classnames'

function date(str) {
  return str && str.length ? moment(str).toDate() : null;
}

export default class EntryList extends Component {
  constructor() {
    super()
    this.state = { isFiltersetValid: false, wasSubmitted: false }
  }
  getFilterValues() {
    const fromTime = moment(this.refs.fromTime.refs.inner.props.value);
    const toTime = moment(this.refs.toTime.refs.inner.props.value);
    return {
      fromDate: moment(this.refs.fromDate.refs.inner.props.value).format('YYYYMMDD'),
      toDate: moment(this.refs.toDate.refs.inner.props.value).format('YYYYMMDD'),
      fromTime: fromTime.hours()*60+fromTime.minutes(),
      toTime: toTime.hours()*60+toTime.minutes()
    }
  }
  isFiltersetValid() {
    const filters = this.getFilterValues();
    return Object.keys(filters).every((key) => filters[key] )
  }
  filterClick() {
    this.setState({ isFiltersetValid: this.isFiltersetValid(), wasSubmitted: true }, function() {
      if(this.state.isFiltersetValid) {
        this.props.onFilterClick(this.getFilterValues())
      }
    });
  }
  addEntryClick() {
    this.props.onAddEntryClick();
  }
  clearFilterClick() {
    this.props.onClearFilterClick();
  }
  render() {
    const {
      entries,
      dailyCaloricIntake,
      pagingData: { page, limit, total },
      filters: { fromDate, toDate, fromTime, toTime },
      handleDeleteClick, handleEditClick, handlePageSelect,
      expectedDailyCalories
    } = this.props;

    return (
      <section >
        <div className={classnames({'expected-daily-calories': true, 'text-right': true, 'invalid': (dailyCaloricIntake > expectedDailyCalories)})} >
          Total Daily Calories: {dailyCaloricIntake}
        </div>
        <Form className={classnames({'entries--filters': true, 'is-invalid': !this.state.isFiltersetValid && this.state.wasSubmitted })}>
          <FormRow>
            <FormField width="one-quarter" label='From Date' htmlFor='fromDate'>
              <DateTimePicker ref="fromDate" parse={date} time={false} defaultValue={null}></DateTimePicker>
            </FormField>
            <FormField width="one-quarter" label='To Date' htmlFor='toDate'>
              <DateTimePicker ref="toDate" parse={date} time={false} defaultValue={null}></DateTimePicker>
            </FormField>
            <FormField width="one-quarter" label='From time' htmlFor='fromTime'>
              <DateTimePicker ref="fromTime" parse={date} calendar={false} defaultValue={null}></DateTimePicker>
            </FormField>
            <FormField width="one-quarter" label='To time' htmlFor='toTime'>
              <DateTimePicker ref="toTime" parse={date} calendar={false} defaultValue={null}></DateTimePicker>
            </FormField>
          </FormRow>
          {(() => {
            if(!this.state.isFiltersetValid && this.state.wasSubmitted) {
              return <FormField><div className="form-validation is-invalid">All fields are required.</div></FormField>
            }
          })()}
          {(() => {
            if(Object.keys(this.props.filters).length) {
              return (
                <div className="entries--current-filters">Current filters: {fromDate} - {toDate} - {fromTime} -{toTime}</div>
              )
            }
          })()}
          <div className="text-right">
            {(() => {
              if(Object.keys(this.props.filters).length) {
                return <Button onClick={this.clearFilterClick.bind(this)}>Clear Filters</Button>
              }
            })()}{' '}
            <Button onClick={this.addEntryClick.bind(this)}>Add Entry</Button>{' '}
            <Button onClick={this.filterClick.bind(this)}>Filter</Button>
          </div>
        </Form>
        <div className="entries">
          { entries ? entries.map((entry) => <Entry entry={entry} onDeleteClick={handleDeleteClick} onEditClick={handleEditClick} key={entry._id}></Entry>) : 'No entries available' }
        </div>
        <Pagination currentPage={page} onPageSelect={handlePageSelect} pageSize={limit} total={total} />
      </section>
    );
  }
}