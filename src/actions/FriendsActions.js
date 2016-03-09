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
          console.log('ask friendship');
          console.log(err);
          console.log(result);
          if (err) {
            return this.askFriendshipFailed(err);
          }

          this.askFriendshipSuccess(id);
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
    
      request('POST', '/api/v2/friendships/accept/' + friendship_id)
        .end((err) => {
          console.log('accept friendship');
          console.log(err);
          console.log(result);
          // besoin de me retourner la friendship ie infos du friend
          if (err, result) {
            return this.acceptFriendshipFailed(err);
          }

          this.acceptFriendshipSuccess(result);
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
    
      request('POST', '/api/v2/friendships/refuse/' + friendship_id)
        .end((err) => {
          console.log('refuse friendship');
          console.log(err);
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
          console.log('remove friendship');
          console.log(err);
          console.log(result);
          if (err) {
            return this.removeFriendshipFailed(err);
          }

          if (callback) {
            callback();
          }

          this.removeFriendshipSuccess(friendship_id);
        });
    }
  }

  removeFriendshipSuccess(id) {
    return id;
  }

  removeFriendshipFailed(err) {
    return err;
  }

  maskProfil(friendship_id) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/friendships/make_invisible')
        .query({id: friendship_id})
        .end((err, result) => {
          console.log('mask profil');
          console.log(err);
          console.log(result);
          if (err) {
            return this.maskProfilFailed(err);
          }

          this.maskProfilSuccess({friendship_id: friendship_id, restaurants: result.restaurants});
        });
    }
  }

  maskProfilSuccess(result) {
    return result;
  }

  maskProfilFailed(err) {
    return err;
  }

  displayProfil(friendship_id) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/friendships/make_visible')
        .query({id: friendship_id})
        .end((err, result) => {
          console.log('display profil');
          console.log(err);
          console.log(result);
          if (err) {
            return this.displayProfilFailed(err);
          }

          this.displayProfilSuccess({friendship_id: friendship_id, restaurants: result.restaurants});
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
