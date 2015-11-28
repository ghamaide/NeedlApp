'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  fetchFriends() {
    //this.dispatch();

    request('GET', '/api/friendships')
      .end((err, result) => {
        if (err) {
          return this.actions.friendsFetchFailed(err);
        }

        this.actions.friendsFetched(result);
      });
  }

  friendsFetched(friends) {
    this.dispatch(friends);
  }

  friendsFetchFailed(err) {
    this.dispatch(err);
  }

  fetchPotentialFriends() {
    //this.dispatch();

    request('GET', '/api/friendships/new')
      .end((err, result) => {
        if (err) {
          return this.actions.friendsFetchFailed(err);
        }

        this.actions.friendsFetched(result);
      });
  }

  potentialFriendsFetched(friends) {
    this.dispatch(friends);
  }

  potentialFriendsFetchFailed(err) {
    this.dispatch(err);
  }

  removeFriendship(id, callback) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        destroy: true
      })
      .end((err) => {
        if (err) {
          return this.actions.removeFriendshipFailed(id, err);
        }

        this.actions.removeFriendshipSuccess(id);

        if (callback) {
          callback();
        }
      });
  }

  removeFriendshipSuccess(id) {
    this.dispatch(id);
  }

  removeFriendshipFailed(id, err) {
    this.dispatch({id: id, err: err});
  }

  proposeFriendship(id) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        accepted: false
      })
      .end((err) => {
        if (err) {
          return this.actions.proposeFriendshipFailed(id, err);
        }

        this.actions.proposeFriendshipSuccess(id);
      });
  }

  proposeFriendshipSuccess(id) {
    this.dispatch(id);
  }

  proposeFriendshipFailed(id, err) {
    this.dispatch({id: id, err: err});
  }

  ignoreFriendship(id) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        'not_interested': true
      })
      .end((err) => {
        if (err) {
          return this.actions.ignoreFriendshipFailed(id, err);
        }

        this.actions.ignoreFriendshipSuccess(id);
      });
  }

  ignoreFriendshipSuccess(id) {
    this.dispatch(id);
  }

  ignoreFriendshipFailed(id, err) {
    this.dispatch({id: id, err: err});
  }

  acceptFriendship(id) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        accepted: true
      })
      .end((err) => {
        if (err) {
          return this.actions.acceptFriendshipFailed(id, err);
        }

        this.actions.acceptFriendshipSuccess(id);
      });
  }

  acceptFriendshipSuccess(id) {
    this.dispatch(id);
  }

  acceptFriendshipFailed(id, err) {
    this.dispatch({id: id, err: err});
  }

  requestsSeen() {
    this.dispatch();
  }
}

export default alt.createActions(FriendsActions);
