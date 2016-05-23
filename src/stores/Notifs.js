'use strict';

import {PushNotificationIOS} from 'react-native';

import _ from 'lodash';
import moment from 'moment';

import alt from '../alt';

import FollowingsActions from '../actions/FollowingsActions';
import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';
import NotifsActions from '../actions/NotifsActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';

import MeStore from './Me';
import ProfilStore from './Profil';

import CachedStore from './CachedStore';

export class NotifsStore extends CachedStore {

  constructor() {
    super();

    this.status.notificationsPush = 0;

    PushNotificationIOS.addEventListener('notification', (notification) => {
      if (notification.getData().type === 'reco') {
        this.status.notificationsPush = this.status.notificationsPush + 1;
        this.emitChange();
      }
    });

    this.friendsNotifications = [];
    this.followingsNotifications = [];
    this.myNotifications = [];

    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleFetchNotifications: NotifsActions.FETCH_NOTIFICATIONS,
      handleFetchNotificationsSuccess: NotifsActions.FETCH_NOTIFICATIONS_SUCCESS,
      handleFetchNotificationsFailed: NotifsActions.FETCH_NOTIFICATIONS_FAILED,

      handleNotificationsSeen: NotifsActions.NOTIFICATIONS_SEEN,
      handleNotificationsSeenFailed: NotifsActions.NOTIFICATIONS_SEEN_FAILED,
      handleNotificationsSeenSuccess: NotifsActions.NOTIFICATIONS_SEEN_SUCCESS,

      handleFetchProfilSuccess: ProfilActions.FETCH_PROFIL_SUCCESS,

      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleMaskProfilSuccess: FriendsActions.MASK_PROFIL_SUCCESS,
      handleDisplayProfilSuccess: FriendsActions.DISPLAY_PROFIL_SUCCESS,

      handleFollowExpertSuccess: FollowingsActions.FOLLOW_EXPERT_SUCCESS,
      handleUnfollowExpertSuccess: FollowingsActions.UNFOLLOW_EXPERT_SUCCESS,

      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,
      handleUpdateRecommendationSuccess: RecoActions.UPDATE_RECOMMENDATION_SUCCESS,
      handleRemoveRecoSuccess: RecoActions.REMOVE_RECO_SUCCESS,

      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,
      handleRemoveWishSuccess: RecoActions.REMOVE_WISH_SUCCESS,

      handleLogout: LoginActions.CALLBACK_LOGOUT
    });
  }

  handleFetchNotifications() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchNotificationsSuccess(notifications) {
    var oldNotifications = _.concat(this.friendsNotifications, this.followingsNotifications);
    var editedNotifications = _.map(notifications, (notification) => {

      // Mark notifications as seen if last read date is prior to notification date
      if (notification.date >= this.notifications_read_date || this.notifications_read_date == null) {
        notification.seen = false;
      } else {
        notification.seen = true;
      }

      // Add formatted date for display
      var temp_date = moment(notification.date);
      var formatted_date = this.formatDate(temp_date.date(), temp_date.month(), temp_date.year());
      notification.formatted_date = formatted_date;

      return notification;
    });

    // Friends notifications
    this.friendsNotifications = _.filter(editedNotifications, (notification) => {
      return notification.user_type === 'friend';
    });

    // Followings notifications
    this.followingsNotifications = _.filter(editedNotifications, (notification) => {
      return notification.user_type === 'following';
    });

    // My notifications
    this.myNotifications = _.filter(editedNotifications, (notification) => {
      return notification.user_type === 'me';
    });

    this.status.notificationsPush = 0;
    this.status.loading = false;
  }

  handleFetchNotificationsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleNotificationsSeen() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleNotificationsSeenFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleNotificationsSeenSuccess(result) {
    // Update notifications read date
    this.notifications_read_date = result.notification_date;

    // Update notifications as seen according to the read date
    this.friendsNotifications = _.map(this.friendsNotifications, (notification) => {
      notification.seen = true;
      return notification;
    });

    this.followingsNotifications = _.map(this.followingsNotifications, (notification) => {
      notification.seen = true;
      return notification;
    });
  }

  handleFetchProfilSuccess(profil) {
    if (profil.id === MeStore.getState().me.id) {
      this.notifications_read_date = profil.notifications_read_date;
    }
  }

  handleAcceptFriendshipSuccess(result) {
    // Add friend activities to friends notifications
    _.forEach(result.activities, (activity) => {
      var temp_date = moment(activity.date);
      var formatted_date = this.formatDate(temp_date.date(), temp_date.month(), temp_date.year());
      this.friendsNotifications.push(_.extend(activity, {formatted_date: formatted_date, seen: true}));
    });
  }

  handleRemoveFriendshipSuccess(result) {
    // Remove friend activities from friends notifications
    var friend_id = ProfilStore.getFriendFromFriendship(result.friendship_id).id;
    _.remove(this.friendsNotifications, (notification) => {return notification.user_id === friend_id});
  }

  handleDisplayProfilSuccess(result) {
    // Add friend activities to friends notifications
    _.forEach(result.notifications, (notification) => {
      var temp_date = moment(notification.date);
      var formatted_date = this.formatDate(temp_date.date(), temp_date.month(), temp_date.year());
      this.friendsNotifications.push(_.extend(notification, {formatted_date: formatted_date, seen: true}));
    })
  }

  handleMaskProfilSuccess(result) {
    // Remove friend activities from friends notifications
    var friend_id = ProfilStore.getFriendFromFriendship(result.friendshipId).id;
    _.remove(this.friendsNotifications, (notification) => {return notification.user_id === friend_id});
  }

  handleFollowExpertSuccess(result) {
    _.forEach(result.activities, (activity) => {
      var temp_date = moment(activity.date);
      var formatted_date = this.formatDate(temp_date.date(), temp_date.month(), temp_date.year());
      this.followingsNotifications.push(_.extend(activity, {formatted_date: formatted_date, seen: true}));
    })
  }

  handleUnfollowExpertSuccess(result) {
    var expert_id = ProfilStore.getFollowingFromFollowership(result.followership_id).id;
    _.remove(this.followingsNotifications, (notification) => {
      return notification.user_id == expert_id;
    })
  }

  handleAddRecoSuccess(result) {
    // Add activity if not there, else update activity
    var index = _.findIndex(this.myNotifications, (notification) => {
      return notification.restaurant_id === result.restaurant.id && notification.user_id === MeStore.getState().me.id;
    });

    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleUpdateRecommendationSuccess(result) {
    // Add activity if not there, else update activity
    var index = _.findIndex(this.myNotifications, (notification) => {
      return notification.restaurant_id === result.restaurant.id && notification.user_id === MeStore.getState().me.id;
    });

    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleRemoveRecoSuccess(restaurant) {
    _.remove(this.myNotifications, (notification) => {
      return notification.user_id === MeStore.getState().me.id && notification.restaurant_id === restaurant.id;
    });
  }

  handleAddWishSuccess(result) {
    // Add activity if not there, else update activity
    var index = _.findIndex(this.myNotifications, (notification) => {
      return notification.restaurant_id === result.restaurant.id && notification.user_id === MeStore.getState().me.id;
    });

    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleRemoveWishSuccess(restaurant) {
    _.remove(this.myNotifications, (notification) => {
      return notification.user_id === MeStore.getState().me.id && notification.restaurant_id === restaurant.id;
    })
  }

  handleLogout() {
    this.friendsNotifications = [];
    this.followingsNotifications = [];
    this.myNotifications = [];
    this.status.notificationsPush = 0;
  }

  formatDate(day, month, year) {
    var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    var formatted_date = day + ' ' + months[month] + ' ' + year;

    return formatted_date;
  }

  static isSeen(restaurantId, userId) {
    var notifications = _.concat(this.getState().friendsNotifications, this.getState().followingsNotifications);
    var index = _.findIndex(notifications, {'restaurant_id': restaurantId, 'user_id': userId});
    return notifications[index] && notifications[index].seen;
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }

  static nbUnseenNotifs() {
    var notifications = _.concat(this.getState().friendsNotifications, this.getState().followingsNotifications);
    return _.reduce(notifications, (unseen, notification) => {
      if (!notification.seen) {
        return unseen + 1;
      }
      return unseen;
    }, 0) + this.getState().status.notificationsPush;
  }

  static getRecommendation(restaurant_id, user_id) {
    var notifications = _.concat(this.getState().myNotifications, this.getState().friendsNotifications, this.getState().followingsNotifications);
    var index = _.findIndex(notifications, {'restaurant_id': restaurant_id, 'user_id': user_id});
    return notifications[index];
  }

  static getRecommendationsFromUser(user_id) {
    var notifications = _.concat(this.getState().myNotifications, this.getState().friendsNotifications, this.getState().followingsNotifications);
    
    var notifications_from_user = _.filter(notifications, (notification) => {
      return notification.notification_type == 'recommendation' && notification.user_id == user_id;
    });

    return notifications_from_user;
  }

  static getFriendsNotifications() {
    return _.reverse(_.sortBy(this.getState().friendsNotifications, 'date'));
  }

  static getFollowingsNotifications() {
    return _.reverse(_.sortBy(this.getState().followingsNotifications, 'date'));
  }
}

export default alt.createStore(NotifsStore);
