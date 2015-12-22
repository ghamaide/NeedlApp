'use strict';

import alt from '../alt';
import LoginUtils from '../utils/login';

export class LoginActions {

  loginSuccess(me) {
    return me;
  }

  loginFailed(err) {
    return err;
  }

  loginCancelled() {
    return function (dispatch) {
      dispatch()
    }
  }

  logout() {
    return function (dispatch) {
      dispatch()
    }
  }

  login() {
    return (dispatch) => {
      dispatch()
      LoginUtils.facebook((err, me) => {
        if (err === 'cancelled') {
          return this.loginCancelled();
        }
        if (err) {
          return this.loginFailed(err);
        }
        this.loginSuccess(me);
      });
    }
  }
}

export default alt.createActions(LoginActions);
