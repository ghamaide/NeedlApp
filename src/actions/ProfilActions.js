'use strict';

import alt from '../alt';
import request from '../utils/api';

export class ProfilActions {

  fetchProfil(id) {
    return (dispatch) => {
      dispatch(id);

      request('GET', '/api/v2/users/' + id)
        .end((err, result) => {
          if (err) {
            return this.fetchProfilFailed(err, id);
          }

          this.fetchProfilSuccess(result);
        });
    }
  }

  fetchProfilSuccess(profil) {
    return profil;
  }

  fetchProfilFailed(err, id) {
    return err;
  }

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

  fetchFollowings() {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/followerships')
        .end((err, result) => {
          if (err) {
            return this.fetchFollowingsFailed(err);
          }

          this.fetchFollowingsSuccess(result);
        });
    }
  }

  fetchFollowingsFailed(err) {
    return err;
  }

  fetchFollowingsSuccess(result) {
    return result;
  }

  maskProfil(id) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/friendships')
        .query({
          'friend_id': id,
          invisible: true
        })
        .end((err) => {
          if (err) {
            return this.maskProfilFailed(err);
          }

          this.maskProfilSuccess(id);
        });
    }
  }

  maskProfilSuccess(id) {
    return id;
  }

  maskProfilFailed(err) {
    return err;
  }

  displayProfil(id) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/friendships')
        .query({
          'friend_id': id,
          invisible: false
        })
        .end((err, result) => {
          if (err) {
            return this.displayProfilFailed(err);
          }

          this.displayProfilSuccess(id);
          // this.displayProfilSuccess(result);
        });
    }
  }

  displayProfilSuccess(result) {
    return result;
  }

  displayProfilFailed(err) {
    return err;
  }
}

export default alt.createActions(ProfilActions);
