'use strict';

import {PushNotificationIOS} from 'react-native';

import alt from '../alt';
import _ from 'lodash';
import FriendsActions from '../actions/FriendsActions';
import MeStore from './Me';
import CachedStore from './CachedStore';

export class FriendsStore extends CachedStore {

  constructor() {
    super();

    this.status.notifsPush = 0;

    PushNotificationIOS.addEventListener('notification', (notif) => {
      if (notif.getData().type === 'friend') {
        this.status.notifsPush = this.status.notifsPush + 1;
        this.emitChange();
      }
    });

    this.friends = [];
    
    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleFetchFriends: FriendsActions.FETCH_FRIENDS,
      handleFriendsFetched: FriendsActions.FRIENDS_FETCHED,
      handleFriendsFetchFailed: FriendsActions.FRIENDS_FETCH_FAILED,

// ================================================================================================
    });
  }

  handleFetchFriends() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFriendsFetched(friends) {
    this.friends = friends;
    this.status.notifsPush = 0;
    this.status.loading = false;
  }

  handleFriendsFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  static getFriends() {
    return this.getState().friends;
  }

  static error() {
    return this.getState().status.friendsLoadingError;
  }

  static loading() {
    return this.getState().status.friendsLoading;
  }
}

export default alt.createStore(FriendsStore);
