'use strict';

import alt from '../alt';
import request from '../utils/api';

export class ProfilActions {

  fetchProfil(id) {
    //this.dispatch(id);

    request('GET', '/api/users/' + id)
      .end((err, result) => {
        if (err) {
          return this.actions.profilFetchFailed(err, id);
        }

        this.actions.profilFetched(result);
      });
  }

  profilFetched(profil) {
    this.dispatch(profil);
  }

  profilFetchFailed(err, id) {
    this.dispatch({err: err, id: id});
  }

  maskProfil(id) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        invisible: true
      })
      .end((err) => {
        if (err) {
          return this.actions.maskProfilFailed(id, err);
        }

        this.actions.maskProfilSuccess(id);
      });
  }

  maskProfilSuccess(id) {
    this.dispatch(id);
  }

  maskProfilFailed(id, err) {
    this.dispatch({id: id, err: err});
  }

  displayProfil(id) {
    this.dispatch(id);

    request('GET', '/api/friendships')
      .query({
        'friend_id': id,
        invisible: false
      })
      .end((err) => {
        if (err) {
          return this.actions.displayProfilFailed(id, err);
        }

        this.actions.displayProfilSuccess(id);
      });
  }

  displayProfilSuccess(id) {
    this.dispatch(id);
  }

  displayProfilFailed(id, err) {
    this.dispatch({id: id, err: err});
  }
}

export default alt.createActions(ProfilActions);
