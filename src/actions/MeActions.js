'use strict';

import alt from '../alt';
import request from '../utils/api';
import MeStore from '../stores/Me';

export class FriendsActions {

  edit(name, email, success) {
    this.dispatch();

    request('GET', '/api/registrations/' + MeStore.getState().me.id + '/edit')
      .query({
        name: name,
        email: email
      })
      .end((err) => {
        if (err) {
          return this.actions.editFailed(err);
        }

        this.actions.editSuccess({
          name: name,
          email: email
        });

        success();
      });
  }

  editSuccess(data) {
    console.log(data);
    this.dispatch(data);
  }

  editFailed(err) {
    this.dispatch(err);
  }

  cleanEditError() {
    this.dispatch();
  }

  uploadList(uri, callback) {
    this.dispatch();

    request.uploadPhoto('picture', uri, '/api/user_wishlist_pictures.json', (err) => {
      if (err) {
        return this.actions.uploadListFailed(err);
      }

      this.actions.uploadListSuccess();

      if (callback) {
        callback();
      }
    });
  }

  uploadListFailed(err) {
    this.dispatch(err);
  }

  uploadListSuccess() {
    this.dispatch();
  }

  hasBeenUploadWelcomed() {
    this.dispatch();
  }

  saveDeviceToken(token) {
    request('POST', '/api/users/new_parse_installation.json')
      .send({
        'device_type': 'ios',
        'device_token': token
      })
      .end((err) => {
        console.log(err);
      });
  }

  resetBadgeNumber() {
    request('GET', '/api/users/reset_badge_to_zero')
      .end((err) => {
        console.log(err);
      });
  }

  uploadContacts(data) {
    //console.log(data);
    // requets to upload data
  }

  uploadContactsFailed(err) {
    this.dispatch(err);
  }

  uploadContactsSuccess() {
    this.dispatch();
  }
}

export default alt.createActions(FriendsActions);
