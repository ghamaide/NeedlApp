'use strict';

//import {FBLoginManager} from 'NativeModules';
import FBSDKLogin, {FBSDKLoginManager} from 'react-native-fbsdklogin';
import FBSDKCore, {FBSDKAccessToken} from 'react-native-fbsdkcore';

import request from './api';

class Login {
  facebook(callback) {
    console.log('1');
    FBSDKLoginManager.logInWithReadPermissions(['email', 'user_friends'], (err, data) => {
      if (err) {
        console.log('2');
        console.log(err);
        return callback(err);
      } else {
        console.log('3');
        if (data.isCancelled) {
          return callback('cancelled');
        } else {
          console.log('4');
          FBSDKAccessToken.getCurrentAccessToken((token) => {
            console.log('5');
            console.log(token.tokenString);
            request('GET', '/users/auth/facebook_access_token/callback')
              .query({'access_token': token.tokenString})
              .end(callback);
          })
        }
      }
    });
  }
}

/*
class Login {
  facebook(callback) {
    FBLoginManager.loginWithPermissions(['email', 'user_friends'], function(err, data){
      if (err) {
        return callback(err);
      }

      request('GET', '/users/auth/facebook_access_token/callback')
        .query({'access_token': data.credentials.token})
        .end(callback);
    });
  }
}
*/
export default new Login();
