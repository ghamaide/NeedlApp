'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  fetchFriends() {
    return (dispatch) => {
      dispatch();
      
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
}

export default alt.createActions(FriendsActions);
