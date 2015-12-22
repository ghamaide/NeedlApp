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
    this.dispatch();

    request('POST', '/api/users/contacts_access')
      .send({
        'contact_list': data
      })
      .set('Accept', 'application/json')
      .end((err) => {
        if(err) {
          return this.actions.uploadContactsFailed(err);
        }

        this.actions.uploadContactsSuccess();
      });
  }

  uploadContactsFailed(err) {
    this.dispatch(err);
  }

  uploadContactsSuccess() {
    this.dispatch();
  }

  sendMessageContact(data) {
    this.dispatch();

    request('POST', '/api/users/invite_contact')
      .send({
        'contact' : data
      })
      .end((err) => {
        if(err) {
          return this.actions.sendMessageContactFailed(err);
        }

        this.actions.sendMessageContactSuccess();
      });
  }

  sendMessageContactFailed(err) {
    this.dispatch(err);
  }

  sendMessageContactSuccess() {
    this.dispatch();
  }

  displayTabBar(display) {
    this.dispatch(display);
  }

  setVersion(version) {
    this.dispatch(version);
  }

  showedCurrentPosition(showed) {
    this.dispatch(showed);
  }
}

export default alt.createActions(FriendsActions);
