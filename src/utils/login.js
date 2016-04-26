'use strict';

import {LoginManager, AccessToken} from 'react-native-fbsdk';

import request from './api';

class Login {
  facebook(callback, friend_id, restaurant_id) {
    LoginManager.logInWithReadPermissions(['email', 'user_friends']).then(
      function(data) {
        AccessToken.getCurrentAccessToken().then((accessToken) => {
          request('GET', '/users/auth/facebook_access_token/callback')
            .query({'access_token': accessToken.accessToken, friend_id: friend_id, restaurant_id: restaurant_id})
            .end(callback);
        });
      },
      function(error) {
        return callback(error);
      }
    );
  }
}

export default new Login();

