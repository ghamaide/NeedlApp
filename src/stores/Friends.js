'use strict';

import {PushNotificationIOS} from 'react-native';

import _ from 'lodash';

import alt from '../alt';

import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';

import CachedStore from './CachedStore';
import MeStore from './Me';

export class FriendsStore {

  constructor() {
    this.searched_users = [];
    
    this.loading = false;
    this.error = {};

    this.bindListeners({
      handleAskFriendship: FriendsActions.ASK_FRIENDSHIP,
      handleAskFriendshipFailed: FriendsActions.ASK_FRIENDSHIP_FAILED,
      handleAskFriendshipSuccess: FriendsActions.ASK_FRIENDSHIP_SUCCESS,

      handleAcceptFriendship: FriendsActions.ACCEPT_FRIENDSHIP,
      handleAcceptFriendshipFailed: FriendsActions.ACCEPT_FRIENDSHIP_FAILED,
      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,

      handleRefuseFriendship: FriendsActions.REFUSE_FRIENDSHIP,
      handleRefuseFriendshipFailed: FriendsActions.REFUSE_FRIENDSHIP_FAILED,
      handleRefuseFriendshipSuccess: FriendsActions.REFUSE_FRIENDSHIP_SUCCESS,

      handleRemoveFriendship: FriendsActions.REMOVE_FRIENDSHIP,
      handleRemoveFriendshipFailed: FriendsActions.REMOVE_FRIENDSHIP_FAILED,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleSearchUsers: FriendsActions.SEARCH_USERS,
      handleSearchUsersFailed: FriendsActions.SEARCH_USERS_FAILED,
      handleSearchUsersSuccess: FriendsActions.SEARCH_USERS_SUCCESS,
    });
  }

  handleAskFriendship() {
    this.loading = true;
    delete this.error;
  }

  handleAskFriendshipFailed(err) {
    return err;
  }

  handleAskFriendshipSuccess(result) {
    this.loading = false;
  }

  handleAcceptFriendship() {
    this.loading = true;
    delete this.error;
  }

  handleAcceptFriendshipFailed(err) {
    return err;
  }

  handleAcceptFriendshipSuccess(result) {
    this.loading = false;
  }

  handleRefuseFriendship() {
    this.loading = true;
    delete this.error;
  }

  handleRefuseFriendshipFailed(err) {
    return err;
  }

  handleRefuseFriendshipSuccess(result) {
    this.loading = false;
  }

  handleRemoveFriendship() {
    this.loading = true;
    delete this.error;
  }

  handleRemoveFriendshipFailed(err) {
    this.loading = false;
    this.error = err;
  }

  handleRemoveFriendshipSuccess(result) {
    this.loading = false;
  }

  handleSearchUsers() {
    this.loading = true;
    delete this.error;
  }

  handleSearchUsersFailed(err) {
    this.loading = false;
    this.error = err;
  }

  handleSearchUsersSuccess(users) {
    this.loading = false;
    this.searched_users = users;
  }

  static getSearchedUsers() {
    return this.getState().searched_users;
  }

  static error() {
    return this.getState().error;
  }

  static loading() {
    return this.getState().loading;
  }
}

export default alt.createStore(FriendsStore);
