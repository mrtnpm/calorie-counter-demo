import { Pagination } from 'elemental'
import { Button } from 'elemental'
import React, { Component } from 'react';
import User from 'components/User'

export default class UserList extends Component {
  render() {
    const {
      users,
      pagingData: { page, limit, total },
      handleDeleteClick, handleEditClick, handlePageSelect, onAddNewUserClick
    } = this.props;

    return (
      <section>
        <div className="text-right users--toolbar">
          <Button onClick={onAddNewUserClick}>Create New User</Button>
        </div>
        <div className="users">
          { users ? users.map((user) => <User user={user} onDeleteClick={handleDeleteClick} onEditClick={handleEditClick} key={user._id}></User>) : 'No users available' }
        </div>
        <Pagination currentPage={page} onPageSelect={handlePageSelect} pageSize={limit} total={total} />
      </section>
    );
  }
}