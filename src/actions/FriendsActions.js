'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  fetchFriends() {
    return (dispatch) => {
      dispatch();
      
      request('GET', '/api/v2/friendships')
        .end((err, result) => {
          if (err) {
            return this.fetchFriendsFailed(err);
          }

          this.fetchFriendsSuccess(result);
        });
    }
  }

  fetchFriendsSuccess(friends) {
    return friends;
  }

  fetchFriendsFailed(err) {
    return err;
  }

  removeFriendship(id, callback) {
    return (dispatch) => {
      dispatch();
    
      request('GET', '/api/v2/friendships')
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
    return err;
  }

  searchContacts(query) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/users')
        .query({
          query: query
        })
        .end((err, result) => {
          // console.log('----');
          // console.log(err);
          if (err) {
            this.searchContactsFailed(err);
          }

          this.searchContactsSuccess(result);
        });
    }
  }

  searchContactsFailed(err) {
    return err;
  }

  searchContactsSuccess(result) {
    return result;
  }
}

export default alt.createActions(FriendsActions);
