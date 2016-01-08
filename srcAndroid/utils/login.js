'use strict';

import {FBLoginManager} from 'NativeModules';
//import FBSDKLogin, {FBSDKLoginManager} from 'react-native-fbsdklogin';
//import FBSDKCore, {FBSDKAccessToken} from 'react-native-fbsdkcore';

import request from './api';
/*
class Login {
  facebook(callback) {
    FBSDKLoginManager.logInWithReadPermissions(['email', 'user_friends'], (err, data) => {
      if (err) {
        return callback(err);
      } else {
        if (data.isCancelled) {
          return callback('cancelled');
        } else {
          FBSDKAccessToken.getCurrentAccessToken((token) => {
            request('GET', '/users/auth/facebook_access_token/callback')
              .query({'access_token': token.tokenString})
              .end(callback);
          })
        }
      }
    });
  }
}
*/

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
