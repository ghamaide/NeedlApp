'use strict';

import qs from 'qs';

import LoginUtils from '../utils/login';
import request from '../utils/api';

import alt from '../alt';

export class LoginActions {
  loginFacebook() {
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
      });
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

  createAccount(user) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/registrations.json')
        .query(qs.stringify(user, { arrayFormat: 'brackets' }))
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
}

export default alt.createActions(LoginActions);
