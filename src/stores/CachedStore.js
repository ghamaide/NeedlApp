'use strict';

import {AsyncStorage} from 'react-native';
import _ from 'lodash';

export class CachedStore {
  constructor() {
    this.status = {};

    this.initializeCachedStore();
  }

  initializeCachedStore() {
    this.status.ready = false;

    AsyncStorage.getItem('v3.8.111.STORE' + this.displayName, (err, state) => {
      state = err ? {} : JSON.parse(state || '{}');

      _.extend(this, state);
      this.status.ready = true;

      this.emitChange();

      this.getInstance().listen(() => {
        AsyncStorage.setItem('v3.8.111.STORE' + this.displayName, JSON.stringify(_.omit(this.getInstance().getState(), 'status')), () => {});
      });
    });
  }
}

export default CachedStore;
