'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  removeFriendship(id, callback) {
    return (dispatch) => {
      dispatch();
    
      request('DELETE', '/api/v2/friendships/' + id)
        .end((err) => {
          if (err) {
            return this.removeFriendshipFailed(err);
          }

          if (callback) {
            callback();
          }

          this.removeFriendshipSuccess(id);
        });
    }
  }

  removeFriendshipSuccess(id) {
    return id;
  }

  removeFriendshipFailed(err) {
    return err;
  }

  searchUsers(query) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/users')
        .query({
          query: query
        })
        .end((err, result) => {
          if (err) {
            this.searchUsersFailed(err);
          }

          this.searchUsersSuccess(result);
        });
    }
  }

  searchUsersFailed(err) {
    return err;
  }

  searchUsersSuccess(result) {
    return result;
  }

  searchFollowings(query) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/followings')
        .query({
          query: query
        })
        .end((err, result) => {
          if (err) {
            this.searchFollowingsFailed(err);
          }

          this.searchFollowingsSuccess(result);
        });
    }
  }

  searchFollowingsFailed(err) {
    return err;
  }

  searchFollowingsSuccess(result) {
    return result;
  }

  resetSearch() {
    return function (dispatch) {
      dispatch();
    }
  }
}

export default alt.createActions(FriendsActions);
