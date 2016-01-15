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

    this.data = {
      friends: [],
      requests: []
    };
    this.status.friendsLoading = false;
    this.status.friendsLoadingError = null;

    this.status.potentialFriendsLoading = false;
    this.status.potentialFriendsLoadingError = null;

    this.status.friendshipRemoving = [];
    this.status.friendshipRemovingError = {};

    this.status.friendshipProposing = [];
    this.status.friendshipProposingError = {};

    this.status.friendshipIgnoring = [];
    this.status.friendshipIgnoringError = {};

    this.status.friendshipAccepting = [];
    this.status.friendshipAcceptingError = {};

    this.bindListeners({
      handleFetchFriends: FriendsActions.FETCH_FRIENDS,
      handleFriendsFetched: FriendsActions.FRIENDS_FETCHED,
      handleFriendsFetchFailed: FriendsActions.FRIENDS_FETCH_FAILED,

      handleRemoveFriendship: FriendsActions.REMOVE_FRIENDSHIP,
      handleRemoveFriendshipFailed: FriendsActions.REMOVE_FRIENDSHIP_FAILED,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleIgnoreFriendship: FriendsActions.IGNORE_FRIENDSHIP,
      handleIgnoreFriendshipFailed: FriendsActions.IGNORE_FRIENDSHIP_FAILED,
      handleIgnoreFriendshipSuccess: FriendsActions.IGNORE_FRIENDSHIP_SUCCESS,

      setRequestsAsSeen: FriendsActions.REQUESTS_SEEN
    });
  }

  handleIgnoreFriendship(id) {
    this.status.friendshipIgnoring.push(id);
    delete this.status.friendshipIgnoringError[id];
  }
  handleIgnoreFriendshipFailed(data) {
    _.remove(this.status.friendshipIgnoring, function(id) {
      return id === data.id;
    });
    this.status.friendshipIgnoringError[data.id] = data.err;
  }
  handleIgnoreFriendshipSuccess(idProfil) {
    _.remove(this.status.friendshipIgnoring, function(id) {
      return id === idProfil;
    });
    this.data.potential_friends = _.map(this.data.potential_friends, function(friend) {
      if (friend.id === idProfil) {
        friend = _.clone(friend);
        friend.ignored = Date.now();
      }

      return friend;
    });
  }
  static ignoreFriendshipError(id) {
    return this.getState().status.friendshipIgnoringError[id];
  }
  static ignoreFriendshipLoading(id) {
    return _.contains(this.getState().status.friendshipIgnoring, id);
  }

  handleRemoveFriendship(id) {
    this.status.friendshipRemoving.push(id);
    delete this.status.friendshipRemovingError[id];
  }
  handleRemoveFriendshipFailed(data) {
    _.remove(this.status.friendshipRemoving, function(id) {
      return id === data.id;
    });
    this.status.friendshipRemovingError[data.id] = data.err;
  }
  handleRemoveFriendshipSuccess(idProfil) {
    _.remove(this.status.friendshipRemoving, function(id) {
      return id === idProfil;
    });
    this.data.friends = _.filter(this.data.friends, function(friend) {
      return friend.id !== idProfil;
    });

    this.data.requests = _.map(this.data.requests, function(friend) {
      if (friend.id === idProfil) {
        friend = _.clone(friend);
        friend.refused = Date.now();
      }

      return friend;
    });
  }
  static removeFriendshipError(id) {
    return this.getState().status.friendshipRemovingError[id];
  }
  static removeFriendshipLoading(id) {
    return _.contains(this.getState().status.friendshipRemoving, id);
  }

  handleFetchFriends() {
    this.waitFor(MeStore);
    this.status.friendsLoading = true;
    delete this.status.friendsLoadingError;
  }

  handleFriendsFetched(friends) {
    friends.requests = _.map(friends.requests, (request) => {
      var oldRequest = _.findWhere(this.data.requests, {id: request.id});
      request.seen = oldRequest && oldRequest.seen;
      return request;
    });

    // on est de nouveau a jour
    this.status.notifsPush = 0;

    this.data = _.extend({}, this.data, friends);
    this.status.friendsLoading = false;
  }

  handleFriendsFetchFailed(err) {
    this.status.friendsLoading = false;
    this.status.friendsLoadingError = err;
  }

  static error() {
    return this.getState().status.friendsLoadingError;
  }

  static loading() {
    return this.getState().status.friendsLoading;
  }

  static nbUnseenRequests() {
    return _.reduce(this.getState().data.requests, function(unseen, request) {
      if (!request.seen) {
        return unseen + 1;
      }
      return unseen;
    }, 0) + this.getState().status.notifsPush;
  }

  setRequestsAsSeen() {
    this.data.requests = _.map(this.data.requests, (request) => {
      request.seen = true;
      return request;
    });
  }
}

export default alt.createStore(FriendsStore);
