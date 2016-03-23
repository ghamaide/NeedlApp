'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FriendsActions {

  askFriendship(id) {
    return (dispatch) => {
      dispatch();
    
      request('POST', '/api/v2/friendships/ask')
        .query({
          friend_id: id
        })
        .end((err, result) => {
          if (err) {
            return this.askFriendshipFailed(err);
          }

          this.askFriendshipSuccess(result);
        });
    }
  }

  askFriendshipFailed(err) {
    return err;
  }

  askFriendshipSuccess(result) {
    return result;
  }

  acceptFriendship(friendship_id) {
    return (dispatch) => {
      dispatch();
    
      request('POST', '/api/v2/friendships/accept')
        .query({id: friendship_id})
        .end((err, result) => {
          console.log(err);
          console.log(result);
          if (err) {
            return this.acceptFriendshipFailed(err);
          }

          this.acceptFriendshipSuccess({friendship_id: friendship_id, friend: result.friend, restaurants: result.restaurants, activities: result.activities});
        });
    }
  }

  acceptFriendshipFailed(err) {
    return err;
  }

  acceptFriendshipSuccess(result) {
    return result;
  }

  refuseFriendship(friendship_id) {
    return (dispatch) => {
      dispatch();
    
      request('POST', '/api/v2/friendships/refuse')
        .query({id: friendship_id})
        .end((err) => {
          if (err) {
            return this.refuseFriendshipFailed(err);
          }

          this.refuseFriendshipSuccess(friendship_id);
        });
    }
  }

  refuseFriendshipFailed(err) {
    return err;
  }

  refuseFriendshipSuccess(friendship_id) {
    return friendship_id;
  }

  removeFriendship(friendship_id, callback) {
    return (dispatch) => {
      dispatch();
    
      request('DELETE', '/api/v2/friendships/' + friendship_id)
        .end((err, result) => {
          if (err) {
            return this.removeFriendshipFailed(err);
          }

          if (callback) {
            callback();
          }

          this.removeFriendshipSuccess({friendship_id: friendship_id, restaurants: result});
        });
    }
  }

  removeFriendshipSuccess(result) {
    return result;
  }

  removeFriendshipFailed(err) {
    return err;
  }

  maskProfil(friendshipId) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/friendships/make_invisible')
        .query({id: friendshipId})
        .end((err, result) => {
          if (err) {
            return this.maskProfilFailed(err);
          }

          this.maskProfilSuccess({friendshipId: friendshipId, restaurants: result.restaurants});
        });
    }
  }

  maskProfilSuccess(result) {
    return result;
  }

  maskProfilFailed(err) {
    return err;
  }

  displayProfil(friendshipId) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/friendships/make_visible')
        .query({id: friendshipId})
        .end((err, result) => {
          if (err) {
            return this.displayProfilFailed(err);
          }

          this.displayProfilSuccess({friendshipId: friendshipId, restaurants: result.restaurants, notifications: result.activities});
        });
    }
  }

  displayProfilSuccess(result) {
    return result;
  }

  displayProfilFailed(err) {
    return err;
  }

  searchUsers(query) {
    return (dispatch) => {
      dispatch();

      if (this.searchUsersRequest) {
        this.searchUsersRequest.abort();
      }

      this.searchUsersRequest = request('GET', '/api/v2/users')
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
}

export default alt.createActions(FriendsActions);
