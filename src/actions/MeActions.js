'use strict';

import alt from '../alt';
import request from '../utils/api';
import MeStore from '../stores/Me';

export class MeActions {

  edit(name, email, success) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/registrations/' + MeStore.getState().me.id + '/edit')
        .query({
          name: name,
          email: email
        })
        .end((err) => {
          if (err) {
            return this.editFailed(err);
          }

          this.editSuccess({
            name: name,
            email: email
          });

          success();
        });
    }
  }

  editSuccess(data) {
    return data;
  }

  editFailed(err) {
    return err;
  }

  cleanEditError() {
    return function (dispatch) {
      dispatch()
    }
  }

  hasBeenUploadWelcomed() {
    return function (dispatch) {
      dispatch();
    }
  }

  saveDeviceToken(token) {
    return (dispatch) => {
      request('POST', '/api/users/new_parse_installation.json')
        .send({
          'device_type': 'ios',
          'device_token': token
        })
        .end((err) => {
          console.log(err);
        });
    }
  }

  resetBadgeNumber() {
    return (dispatch) => {
      request('GET', '/api/users/reset_badge_to_zero')
        .end((err) => {
          console.log(err);
        });
    }
  }

  uploadContacts(data) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/users/contacts_access')
        .send({
          'contact_list': data
        })
        .set('Accept', 'application/json')
        .end((err) => {
          if(err) {
            return this.uploadContactsFailed(err);
          }

          this.uploadContactsSuccess();
        });
    }
  }

  uploadContactsFailed(err) {
    return err;
  }

  uploadContactsSuccess() {
    return function (dispatch) {
      dispatch()
    }
  }

  sendMessageContact(data) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/users/invite_contact')
        .send({
          'contact' : data
        })
        .end((err) => {
          if(err) {
            return this.sendMessageContactFailed(err);
          }

          this.sendMessageContactSuccess(data.recordID);
        });
    }
  }

  sendMessageContactFailed(err) {
    return err;
  }

  sendMessageContactSuccess(id) {
    return id;
  }

  displayTabBar(display) {
    return display;
  }

  setVersion(version) {
    return version;
  }

  sendVersion(version) {
    return (dispatch) => {
      request('GET', '/api/users/update_version')
        .query({
          'version' : version
        })
        .end((err, result) => {
          if(err) {
            return this.sendVersionFailed(err);
          }

          this.sendVersionSuccess(result.is_last_version);
        });
    }
  }

  sendVersionSuccess(result) {
    return result;
  }

  sendVersionFailed(err) {
    return err;
  }

  showedCurrentPosition(showed) {
    return showed;
  }

  hideOverlayMapTutorial() {
    return function (dispatch) {
      dispatch()
    }
  }

  showedUpdateMessage() {
    return function (dispatch) {
      dispatch();
    }
  }
}

export default alt.createActions(MeActions);
