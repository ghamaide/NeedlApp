'use strict';

import {PushNotificationIOS} from 'react-native';

import _ from 'lodash';

import alt from '../alt';

import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';

import CachedStore from './CachedStore';
import MeStore from './Me';

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

    this.searched_users = [];
    this.searched_followings = [];
    
    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleLogout: LoginActions.LOGOUT,

      handleRemoveFriendship: FriendsActions.REMOVE_FRIENDSHIP,
      handleRemoveFriendshipFailed: FriendsActions.REMOVE_FRIENDSHIP_FAILED,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleSearchUsers: FriendsActions.SEARCH_USERS,
      handleSearchUsersFailed: FriendsActions.SEARCH_USERS_FAILED,
      handleSearchUsersSuccess: FriendsActions.SEARCH_USERS_SUCCESS,

      handleSearchFollowings: FriendsActions.SEARCH_FOLLOWINGS,
      handleSearchFollowingsFailed: FriendsActions.SEARCH_FOLLOWINGS_FAILED,
      handleSearchFollowingsSuccess: FriendsActions.SEARCH_FOLLOWINGS_SUCCESS

// ================================================================================================
    });
  }

  handleLogout() {
    this.friends = [];
  }

  handleRemoveFriendship() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleRemoveFriendshipFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveFriendshipSuccess(idProfil) {
    this.status.loading = false;
    this.friends = _.filter(this.data.friends, function(friend) {
      return friend.id !== idProfil;
    });
  }

  handleSearchUsers() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleSearchUsersFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleSearchUsersSuccess(contacts) {
    this.status.loading = false;
    this.searched_contacts = contacts;
  }

  handleSearchFollowings() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleSearchFollowingsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleSearchFollowingsSuccess(followings) {
    this.status.loading = false;
    this.searched_followings = followings;
  }

  static getSearchedUsers() {
    return this.getState().searched_users;
  }

  static getSearchedFollowings() {
    return this.getState().searched_followings;
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }
}

export default alt.createStore(FriendsStore);
