'use strict';

import {NetInfo, Platform} from 'react-native';

import {FBLoginManager} from 'NativeModules';

import alt from '../alt';
import request from '../utils/api';

import MeStore from '../stores/Me';

export class MeActions {

  edit(name, email, success) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/registrations/' + MeStore.getState().me.id + '/edit')
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

  hasBeenUploadWelcomed() {
    return function (dispatch) {
      dispatch();
    }
  }

  saveDeviceToken(token) {
    return (dispatch) => {
      request('POST', '/api/v2/users/new_parse_installation.json')
        .send({
          'device_type': Platform.OS,
          'device_token': token
        })
        .end((err) => {
          if (err) {
          }
        });
    }
  }

  uploadContacts(data) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/users/contacts_access')
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

      request('POST', '/api/v2/users/invite_contact')
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

  startActions(version) {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/users/update_version')
        .query({
          'platform': Platform.OS,
          'version' : version
        })
        .end((err, result) => {
          if(err) {
            return this.startActionsFailed(err);
          }

          request('GET', '/api/v2/users/reset_badge_to_zero')
            .end((err2) => {
              if (err2) {
                return this.startActionsFailed(err2);
              }

              this.startActionsSuccess(result.is_last_version);
          });
        });
    }
  }

  startActionsSuccess(result) {
    return result;
  }

  startActionsFailed(err) {
    return err;
  }

  linkFacebookAccount(callback) {
    return (dispatch) => {
      dispatch()
      
      FBLoginManager.loginWithPermissions(['email', 'user_friends'], (err, data) => {
        if (err) {
          return this.linkFacebookAccountFailed(err);
        }

        var token = (typeof data.credentials === 'undefined' ? data.token : data.credentials.token);

        request('GET', '/users/auth/facebook_access_token/callback')
          .query({
            'access_token': token,
            'link_to_facebook': 'true'
          })
          .end((err, result) => {
            if (err) {
              return this.linkFacebookAccountFailed(err);
            }

            if (callback) {
              callback();
            }

            this.linkFacebookAccountSuccess(result);
          });
      });
    }
  }

  linkFacebookAccountFailed(err) {
    return err;
  }

  linkFacebookAccountSuccess(result) {
    return result;
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