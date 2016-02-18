'use strict';

import alt from '../alt';
import request from '../utils/api';

export class ProfilActions {

  fetchProfil(id) {
    return (dispatch) => {
      dispatch(id);

      request('GET', '/api/users/' + id)
        .end((err, result) => {
          if (err) {
            return this.profilFetchFailed(err, id);
          }

          this.profilFetched(result);
        });
    }
  }

  profilFetched(profil) {
    return profil;
  }

  profilFetchFailed(err, id) {
    return {err: err, id: id};
  }

  fetchProfils() {
    return (dispatch) => {
      dispatch();
      
      request('GET', '/api/friendships')
        .end((err, result) => {
          if (err) {
            return this.fetchProfilsFailed(err);
          }

          this.fetchProfilsSuccess(result);
        });
    }
  }

  fetchProfilsSuccess(friends) {
    return friends;
  }

  fetchProfilsFailed(err) {
    return err;
  }

  maskProfil(id) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/friendships')
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
      dispatch(id);

      request('GET', '/api/friendships')
        .query({
          'friend_id': id,
          invisible: false
        })
        .end((err) => {
          if (err) {
            return this.displayProfilFailed(err);
          }

          this.displayProfilSuccess(id);
        });
    }
  }

  displayProfilSuccess(id) {
    return id;
  }

  displayProfilFailed(err) {
    return err;
  }
}

export default alt.createActions(ProfilActions);
