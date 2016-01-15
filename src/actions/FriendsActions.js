'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  fetchFriends() {
    return (dispatch) => {
      //dispatch();
      request('GET', '/api/friendships')
        .end((err, result) => {
          if (err) {
            return this.friendsFetchFailed(err);
          }

          this.friendsFetched(result);
        });
    }
  }

  friendsFetched(friends) {
    return friends;
  }

  friendsFetchFailed(err) {
    return err;
  }

  removeFriendship(id, callback) {
    return (dispatch) => {
      dispatch(id);
    
      request('GET', '/api/friendships')
        .query({
          'friend_id': id,
          destroy: true
        })
        .end((err) => {
          if (err) {
            return this.removeFriendshipFailed(id, err);
          }

          this.removeFriendshipSuccess(id);

          if (callback) {
            callback();
          }
        });
    }
  }

  removeFriendshipSuccess(id) {
    return id;
  }

  removeFriendshipFailed(id, err) {
    return {id: id, err: err};
  }

  ignoreFriendship(id) {
    return (dispatch) => {
      dispatch(id);
      request('GET', '/api/friendships')
        .query({
          'friend_id': id,
          'not_interested': true
        })
        .end((err) => {
          if (err) {
            return this.ignoreFriendshipFailed(id, err);
          }

          this.ignoreFriendshipSuccess(id);
        });
      }
  }

  ignoreFriendshipSuccess(id) {
    return id;
  }

  ignoreFriendshipFailed(id, err) {
    return {id: id, err: err};
  }

  requestsSeen() {
    return function (dispatch) {
      dispatch()
    }
  }
}

export default alt.createActions(FriendsActions);
