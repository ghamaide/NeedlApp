'use strict';

import {NetInfo, Platform} from 'react-native';

import {FBLoginManager} from 'NativeModules';

import qs from 'qs';

import alt from '../alt';
import request from '../utils/api';

import MeStore from '../stores/Me';

export class MeActions {

  edit(infos, callback) {
    return (dispatch) => {
      dispatch();

      request('PUT', '/api/v2/users/' + MeStore.getState().me.id)
        .query(qs.stringify({
          name: infos.name,
          email: infos.email,
          public: infos.is_public,
          description: infos.description,
          tags: infos.tags
        }, {arrayFormat: 'brackets'}))
        .end((err, result) => {
          if (err) {
            return this.editFailed(err);
          }

          this.editSuccess({
            name: infos.name,
            email: infos.email,
            public: infos.is_public,
            description: infos.description,
            tags: infos.tags
          });

          callback();
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

  hideOverlayTutorial() {
    return function (dispatch) {
      dispatch()
    }
  }

  showedUpdateMessage() {
    return function (dispatch) {
      dispatch();
    }
  }

  hideNewBadge() {
    return function (dispatch) {
      dispatch();
    }
  }

  hideInvitations() {
    return function (dispatch) {
      dispatch();
    }
  }

  checkConnectivity() {
    return (dispatch) => {
      dispatch();

      NetInfo.isConnected.fetch().done((isConnected) => {
        return this.checkConnectivitySuccess(isConnected);
      });
    }
  }

  checkConnectivitySuccess(isConnected) {
    return isConnected;
  }

  uploadPicture(uri, callback) {
    return (dispatch) => {
      dispatch();

      request.uploadPicture('picture', uri, '/api/v2/users/update_picture', (err) => {
        if (err) {
          return this.uploadPictureFailed(err);
        }

        this.uploadPictureSuccess(uri);

        if (callback) {
          callback();
        }
      });
    }
  }

  uploadPictureFailed(err) {
    return err;
  }

  uploadPictureSuccess(result) {
    return result;
  }

  updateOnboardingStatus(page) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/users/update_onboarding_status')
        .query({
          'page': page
        })
        .end((err, result) => {
          if (err) {
            return this.updateOnboardingStatusFailed(err);
          }

          this.updateOnboardingStatusSuccess(page);
        });
    }
  }

  updateOnboardingStatusFailed(err) {
    return err;
  }

  updateOnboardingStatusSuccess(result) {
    return result;
  }
}

export default alt.createActions(MeActions);