'use strict';

import alt from '../alt';
import LoginUtils from '../utils/login';

export class LoginActions {

  loginSuccess(me) {
    this.dispatch(me);
  }

  loginFailed(err) {
    this.dispatch(err);
  }

  loginCancelled() {
    this.dispatch();
  }

  logout() {
    this.dispatch();
  }

  login() {
    this.dispatch();

    LoginUtils.facebook((err, me) => {
      console.log(err);
      if (err) {
        console.log(err);
        return this.actions.loginFailed(err);
      }

      if (err === 'cancelled') {
        return this.actions.loginCancelled();
      }
      this.actions.loginSuccess(me);
    });
  }
}

export default alt.createActions(LoginActions);
