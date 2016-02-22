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

      handleRemoveFriendship: FriendsActions.REMOVE_FRIENDSHIP,
      handleRemoveFriendshipFailed: FriendsActions.REMOVE_FRIENDSHIP_FAILED,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS

// ================================================================================================
    });
  }

  handleFetchFriends() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFriendsFetched(data) {
    this.friends = data.friends;
    this.status.notifsPush = 0;
    this.status.loading = false;
  }

  handleFriendsFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveFriendship() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleRemoveFriendshipFailed(error) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveFriendshipSuccess(idProfil) {
    this.status.loading = false;
    this.friends = _.filter(this.data.friends, function(friend) {
      return friend.id !== idProfil;
    });
  }

  static getFriends() {
    return this.getState().friends;
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }
}

export default alt.createStore(FriendsStore);
