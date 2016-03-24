'use strict';

import {NativeModules} from 'react-native';

import _ from 'lodash';
import request from 'superagent';

import config from '../config';
import MeStore from '../stores/Me';

var REQUESTS = {};

var api = (method, URL) => {
  var r = request(method, config.API + URL);

  // ==> timeout error after 5s
  r.timeout(60000);

  if (MeStore.getState().me.authentication_token) {
    r.query({
      'user_email': MeStore.getState().me.email,
      'user_token': MeStore.getState().me.authentication_token
    });
  }

  // error handling uniformisation
  var oldEnd = r.end;
  r.end = function(callback) {
    var url = r.url;
    var encours = _.some(REQUESTS[url], (query) => {
      return _.isEqual(query, r._query);
    });
    if (encours) {
      return;
    }
    REQUESTS[url] = (REQUESTS[url] || []).concat([r._query]);

    oldEnd.call(r, (err, res) => {
      _.remove(REQUESTS[url], (query) => {
        return _.isEqual(query, r._query);
      });

      if (!err && res.ok) {
        return callback(null, res.body);
      }

      return callback(res && res.body || err || 'UNKNOWN NETWORK ERROR');
    });
  };

  return r;
};

api.uploadPicture = (fileName, pictures, uri, callback) => {
  if (!_.isArray(pictures)) {
    var upload = {
      uri: pictures,
      uploadUrl: config.API + uri + '?user_token=' + MeStore.getState().me.authentication_token + '&user_email=' + MeStore.getState().me.email,
      fileName: fileName,
      mimeType: 'image/jpeg',
      headers: {},
      data: {}
    };

    NativeModules.FileTransfer.upload(upload, (err, res) => {
      if (err || res.status !== 200) {
        if (__DEV__) {
          console.log(err, res.data);
        }
        return callback(err || res.data || 'UNKNOWN NETWORK ERROR');
      }

      callback();
    });
  } else {
    _.forEach(pictures, (picture, key) => {
      var upload = {
        uri: picture,
        uploadUrl: config.API + uri + '?user_token=' + MeStore.getState().me.authentication_token + '&user_email=' + MeStore.getState().me.email,
        fileName: fileName,
        mimeType: 'image/jpeg',
        headers: {},
        data: {}
      };

      NativeModules.FileTransfer.upload(upload, (err, res) => {
        if (err || res.status !== 200) {
          if (__DEV__) {
            console.log(err, res.data);
          }
          return callback(err || res.data || 'UNKNOWN NETWORK ERROR');
        }

        callback();
      });
    });
  }
};

export default api;
