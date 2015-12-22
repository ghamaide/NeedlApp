'use strict';

import alt from '../alt';
import request from '../utils/api';

export class ProfilActions {

  fetchProfil(id) {
    return (dispatch) => {
      //dispatch(id);

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

  maskProfil(id) {
    return (dispatch) => {
      dispatch(id);

      request('GET', '/api/friendships')
        .query({
          'friend_id': id,
          invisible: true
        })
        .end((err) => {
          if (err) {
            return this.maskProfilFailed(id, err);
          }

          this.maskProfilSuccess(id);
        });
    }
  }

  maskProfilSuccess(id) {
    return id;
  }

  maskProfilFailed(id, err) {
    return {id: id, err: err};
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
            return this.displayProfilFailed(id, err);
          }

          this.displayProfilSuccess(id);
        });
    }
  }

  displayProfilSuccess(id) {
    return id;
  }

  displayProfilFailed(id, err) {
    return {id: id, err: err};
  }
}

export default alt.createActions(ProfilActions);
