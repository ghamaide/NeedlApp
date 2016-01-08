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

      handleFetchPotentialFriends: FriendsActions.FETCH_POTENTIAL_FRIENDS,
      handlePotentialFriendsFetched: FriendsActions.POTENTIAL_FRIENDS_FETCHED,
      handlePotentialFriendsFetchFailed: FriendsActions.POTENTIAL_FRIENDS_FETCH_FAILED,

      handleRemoveFriendship: FriendsActions.REMOVE_FRIENDSHIP,
      handleRemoveFriendshipFailed: FriendsActions.REMOVE_FRIENDSHIP_FAILED,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleProposeFriendship: FriendsActions.PROPOSE_FRIENDSHIP,
      handleProposeFriendshipFailed: FriendsActions.PROPOSE_FRIENDSHIP_FAILED,
      handleProposeFriendshipSuccess: FriendsActions.PROPOSE_FRIENDSHIP_SUCCESS,

      handleIgnoreFriendship: FriendsActions.IGNORE_FRIENDSHIP,
      handleIgnoreFriendshipFailed: FriendsActions.IGNORE_FRIENDSHIP_FAILED,
      handleIgnoreFriendshipSuccess: FriendsActions.IGNORE_FRIENDSHIP_SUCCESS,

      handleAcceptFriendship: FriendsActions.ACCEPT_FRIENDSHIP,
      handleAcceptFriendshipFailed: FriendsActions.ACCEPT_FRIENDSHIP_FAILED,
      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,

      setRequestsAsSeen: FriendsActions.REQUESTS_SEEN
    });
  }

  handleAcceptFriendship(id) {
    this.status.friendshipAccepting.push(id);
    delete this.status.friendshipAcceptingError[id];
  }
  handleAcceptFriendshipFailed(data) {
    _.remove(this.status.friendshipAccepting, function(id) {
      return id === data.id;
    });
    this.status.friendshipAcceptingError[data.id] = data.err;
  }
  handleAcceptFriendshipSuccess(idProfil) {
    _.remove(this.status.friendshipAccepting, function(id) {
      return id === idProfil;
    });
    this.data.requests = _.map(this.data.requests, (friend) => {
      if (friend.id === idProfil) {
        friend = _.clone(friend);
        friend.accepted = Date.now();
        this.data.friends.push(friend);
        this.data.friends = _.sortBy(this.data.friends, (f) => {
          return f.name;
        });
      }

      return friend;
    });
  }
  static acceptFriendshipError(id) {
    return this.getState().status.friendshipAcceptingError[id];
  }
  static acceptFriendshipLoading(id) {
    return _.contains(this.getState().status.friendshipAccepting, id);
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

  handleProposeFriendship(id) {
    this.status.friendshipProposing.push(id);
    delete this.status.friendshipProposingError[id];
  }
  handleProposeFriendshipFailed(data) {
    _.remove(this.status.friendshipProposing, function(id) {
      return id === data.id;
    });
    this.status.friendshipProposingError[data.id] = data.err;
  }
  handleProposeFriendshipSuccess(idProfil) {
    _.remove(this.status.friendshipProposing, function(id) {
      return id === idProfil;
    });
    this.data.potential_friends = _.map(this.data.potential_friends, function(friend) {
      if (friend.id === idProfil) {
        friend = _.clone(friend);
        friend.added = Date.now();
      }

      return friend;
    });
  }
  static proposeFriendshipError(id) {
    return this.getState().status.friendshipProposingError[id];
  }
  static proposeFriendshipLoading(id) {
    return _.contains(this.getState().status.friendshipProposing, id);
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

  handleFetchPotentialFriends() {
    //no cache for this ones as it can evolve independently
    // from the user
    delete this.data.potential_friends;
    this.status.potentialFriendsLoading = true;
    delete this.status.potentialFriendsLoadingError;
  }

  handlePotentialFriendsFetched(friends) {
    this.data = _.extend({}, this.data, friends);
    this.status.potentialFriendsLoading = false;
  }

  handlePotentialFriendsFetchFailed(err) {
    this.status.potentialFriendsLoading = false;
    this.status.potentialFriendsLoadingError = err;
  }

  static potentialFriendsError() {
    return this.getState().status.potentialFriendsLoadingError;
  }

  static potentialFriendsLoading() {
    return this.getState().status.potentialFriendsLoading;
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
