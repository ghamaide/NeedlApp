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
          console.log('fetch friends');
          console.log(err);
          console.log(result);
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
          console.log('fetch followings');
          console.log(err);
          console.log(result);
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
          console.log('fetch all experts');
          console.log(err);
          console.log(result);
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
