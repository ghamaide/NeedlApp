'use strict';

import _ from 'lodash';
import qs from 'qs';

import LoginUtils from '../utils/login';
import request from '../utils/api';

import alt from '../alt';

export class LoginActions {
  loginFacebook(friend_id, restaurant_id) {
    return (dispatch) => {
      dispatch()
      LoginUtils.facebook((err, me) => {
        if (err === 'cancelled') {
          return this.loginFacebookCancelled();
        }
        if (err) {
          return this.loginFacebookFailed(err);
        }
        this.loginFacebookSuccess(me);
      }, friend_id, restaurant_id);
    }
  }

  loginFacebookSuccess(me) {
    return me;
  }

  loginFacebookFailed(err) {
    return err;
  }

  loginFacebookCancelled() {
    return function (dispatch) {
      dispatch()
    }
  }

  loginFacebookAndroid(token) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v3/sessions/android_session.json')
        .query({android_temporary_token: token})
          .end((err, result) => {
            if (err) {
              return this.loginFacebookAndroidFailed(err);
            }

            return this.loginFacebookAndroidSuccess(result);
        });
    }
  }

  loginFacebookAndroidFailed(err) {
    return err;
  }

  loginFacebookAndroidSuccess(result) {
    return result;
  }

  loginEmail(user) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/sessions.json')
        .query(qs.stringify(user, { arrayFormat: 'brackets' }))
          .end((err, result) => {
            if (err) {
              return this.loginEmailFailed(err);
            }

            return this.loginEmailSuccess(result);
        });
    }
  }

  loginEmailFailed(err) {
    return err;
  }

  loginEmailSuccess(result) {
    return result;
  }

  createAccount(user, friend_id, restaurant_id) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/registrations.json')
        .query(qs.stringify(_.extend(user, {friend_id: friend_id, restaurant_id: restaurant_id}), { arrayFormat: 'brackets' }))
        .end((err, result) => {
            if (err) {
              return this.createAccountFailed(err);
            }

            return this.createAccountSuccess(result);
        });
    }
  }

  createAccountFailed(err) {
    return err;
  }

  createAccountSuccess(result) {
    return result;
  }

  recoverPassword(email, callback) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/users/update_password')
        .query({
          email: email
        })
        .end((err, result) => {
          if (err) {
            return this.recoverPasswordFailed(err);
          }

          return this.recoverPasswordSuccess(result, callback);
        });
    }
  }

  recoverPasswordFailed(err) {
    return err;
  }

  recoverPasswordSuccess(result, callback) {
    callback();
    return result;
  }

  logout() {
    return function (dispatch) {
      dispatch()
    }
  }

  callbackLogout() {
    return function (dispatch) {
      dispatch()
    }
  }
}

export default alt.createActions(LoginActions);
