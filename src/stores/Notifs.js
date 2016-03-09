'use strict';

import {PushNotificationIOS} from 'react-native';

import _ from 'lodash';
import moment from 'moment';

import alt from '../alt';

import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';
import NotifsActions from '../actions/NotifsActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';

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

      handleSetNotificationsAsSeen: NotifsActions.NOTIFICATIONS_SEEN,

      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleMaskProfilSuccess: FriendsActions.MASK_PROFIL_SUCCESS,
      handleDisplayProfilSuccess: FriendsActions.DISPLAY_PROFIL_SUCCESS,

      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,
      handleUpdateRecommendationSuccess: RecoActions.UPDATE_RECOMMENDATION_SUCCESS,
      handleRemoveRecoSuccess: RecoActions.REMOVE_RECO_SUCCESS,

      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,
      handleRemoveWishSuccess: RecoActions.REMOVE_WISH_SUCCESS,

      handleLogout: LoginActions.LOGOUT
    });
  }

  handleFetchNotifications() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchNotificationsSuccess(notifications) {
    var oldNotifications = _.concat(this.friendsNotifications, this.followingsNotifications);
    var editedNotifications = _.map(notifications, (notification) => {

      var index = _.findIndex(oldNotifications, {'restaurant_id': notification.restaurant_id, 'user_id': notification.user_id});
      var oldNotification = oldNotifications[index];

      notification.seen = oldNotification && oldNotification.seen;

      var temp_date = moment(notification.date);
      var formatted_date = this.formatDate(temp_date.date(), temp_date.month(), temp_date.year());
      notification.formatted_date = formatted_date;

      return notification;
    });

    this.friendsNotifications = _.filter(editedNotifications, (notification) => {
      return notification.user_type === 'friend';
    });

    this.followingsNotifications = _.filter(editedNotifications, (notification) => {
      return notification.user_type === 'following';
    });

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

  handleSetNotificationsAsSeen() {
    this.friendsNotifications = _.map(this.friendsNotifications, (notification) => {
      notification.seen = true;
      return notification;
    });

    this.followingsNotifications = _.map(this.followingsNotifications, (notification) => {
      notification.seen = true;
      return notification;
    });
  }

  handleAcceptFriendshipSuccess(result) {
    var friend_activities = _.map(result.activities, (activity) => {
      var temp_date = moment(activity.date);
      var formatted_date = this.formatDate(temp_date.day(), temp_date.month() + 1, temp_date.year());
      activity.formatted_date = formatted_date;
      activity.seen = true;
    });
    this.friendsNotifications.push(friend_activities);
  }

  handleRemoveFriendshipSuccess(friendship_id) {
    var friend_id = ProfilStore.getFriendFromFriendship(friendship_id).id;
    _.remove(this.friendsNotifications, (notification) => {return notification.user_id === friend_id});
  }

  handleMaskProfilSuccess(friendship_id) {
    var friend_id = ProfilStore.getFriendFromFriendship(friendship_id).id;
    _.remove(this.friendsNotifications, (notification) => {return notification.user_id === friend_id});
  }

  handleDisplayProfilSuccess(result) {
    _.forEach(result.notifications, (notification) => {
      var temp_date = moment(notification.date);
      var formatted_date = this.formatDate(temp_date.day(), temp_date.month() + 1, temp_date.year());
      this.friendsNotifications.push(_.extend(notification, {formatted_date: formatted_date, seen: true}));
    })
  }

  handleAddRecoSuccess(result) {
    var index = _.findIndex(this.myNotifications, {'restaurant_id': result.restaurant.id, 'user_id': MeStore.getState().me.id});
    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleUpdateRecommendationSuccess(result) {
    var index = _.findIndex(this.myNotifications, {'restaurant_id': result.restaurant.id, 'user_id': MeStore.getState().me.id});
    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleRemoveRecoSuccess(restaurant) {
    _.remove(this.myNotifications, (notification) => {
      return notification.user_id == MeStore.getState().me.id && notification.restaurant_id == restaurant.id;
    });
  }

  handleAddWishSuccess(result) {
    var index = _.findIndex(this.myNotifications, {'restaurant_id': result.restaurant.id, 'user_id': MeStore.getState().me.id});
    if (index > -1) {
      this.myNotifications[index] = result.activity;
    } else {
      this.myNotifications.push(result.activity);
    }
  }

  handleRemoveWishSuccess(restaurant) {
    _.remove(this.myNotifications, (notification) => {
      return notification.user_id == MeStore.getState().me.id && notification.restaurant_id == restaurant.id;
    })
  }

  handleLogout() {
    this.friendsNotifications = [];
    this.followingsNotifications = [];
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

  static getFriendsNotifications() {
    return _.reverse(_.sortBy(this.getState().friendsNotifications, 'date'));
  }

  static getFollowingsNotifications() {
    return _.reverse(_.sortBy(this.getState().followingsNotifications, 'date'));
  }
}

export default alt.createStore(NotifsStore);
