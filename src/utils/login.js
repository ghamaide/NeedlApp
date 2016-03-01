'use strict';

import {FBLoginManager} from 'NativeModules';

import request from './api';

class Login {
  facebook(callback) {
    FBLoginManager.loginWithPermissions(['email', 'user_friends'], function(err, data){
      if (err) {
        return callback(err);
      }

      var token = (typeof data.credentials === 'undefined' ? data.token : data.credentials.token);

      request('GET', '/users/auth/facebook_access_token/callback')
        .query({'access_token': token})
        .end(callback);
    });
  }
}

export default new Login();

