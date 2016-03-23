'use strict';

import alt from '../alt';
import request from '../utils/api';

export class ProfilActions {

  fetchProfil(id, callback) {
    return (dispatch) => {
      dispatch();

      console.log('----');

      request('GET', '/api/v2/users/' + id)
        .end((err, result) => {
          if (err) {
            return this.fetchProfilFailed(err);
          }

          this.fetchProfilSuccess(result);

          if (callback) {
            callback();
          }
        });
    }
  }

  fetchProfilSuccess(profil) {
    return profil;
  }

  fetchProfilFailed(err) {
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

  fetchAllExperts() {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/users/experts')
        .end((err, result) => {
          if (err) {
            return this.fetchAllExpertsFailed(err);
          }
          this.fetchAllExpertsSuccess(result);
        });
    }
  }

  fetchAllExpertsFailed(err) {
    return err;
  }

  fetchAllExpertsSuccess(result) {
    return result;
  }
}

export default alt.createActions(ProfilActions);
