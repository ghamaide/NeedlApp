'use strict';

import {PushNotificationIOS} from 'react-native';

import _ from 'lodash';

import alt from '../alt';

import LoginActions from '../actions/LoginActions';
import NotifsActions from '../actions/NotifsActions';
import ProfilActions from '../actions/ProfilActions';

import CachedStore from './CachedStore';

export class NotifsStore extends CachedStore {

  constructor() {
    super();

    this.status.notifsPush = 0;

    PushNotificationIOS.addEventListener('notification', (notif) => {
      if (notif.getData().type === 'reco') {
        this.status.notifsPush = this.status.notifsPush + 1;
        this.emitChange();
      }
    });

    this.notifs = [];
    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleFetchNotifs: NotifsActions.FETCH_NOTIFS,
      handleNotifsFetchSuccess: NotifsActions.NOTIFS_FETCH_SUCCESS,
      handleNotifsFetchFailed: NotifsActions.NOTIFS_FETCH_FAILED,

      handleSetNotifsAsSeen: NotifsActions.NOTIFS_SEEN,

      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfilSuccess: ProfilActions.DISPLAY_PROFIL_SUCCESS,

      handleLogout: LoginActions.LOGOUT

// ================================================================================================

    });
  }

  handleFetchNotifs() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleNotifsFetchSuccess(notifs) {
    this.notifs = _.map(notifs, (notif) => {

      var index = _.findIndex(this.notifs, {'restaurant_id': notif.restaurant_id, 'user_id': notif.user_id});
      var oldNotif = this.notifs[index];
      notif.seen = oldNotif && oldNotif.seen;
      
      var newDate = this.newDate(notif.date);
      notif.date = newDate;

      return notif;
    });

    this.status.notifsPush = 0;
    this.status.loading = false;
  }

  handleNotifsFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleSetNotifsAsSeen() {
    this.notifs = _.map(this.notifs, (notif) => {
      notif.seen = true;
      return notif;
    });
  }

  handleMaskProfilSuccess(id) {
    _.remove(this.notifs, (notification) => {return notification.user_id === id});
  }

  handleDisplayProfilSuccess(result) {
    _.forEach(result.notifs, (notif) => {
      this.notifs.push(_.extend(notif, {date: this.newDate(notif.date), seen: true}));
    })
  }

  handleLogout() {
    this.notifs = [];
  }

  newDate(date) {
    var newDate = '';

    if (date.indexOf('January') > -1) {
      newDate = date.replace('January', 'Janvier');
    } else if (date.indexOf('February') > -1) {
      newDate = date.replace('February', 'Février');
    } else if (date.indexOf('March') > -1) {
      newDate = date.replace('March', 'Mars');
    } else if (date.indexOf('April') > -1) {
      newDate = date.replace('April', 'Avril');
    } else if (date.indexOf('May') > -1) {
      newDate = date.replace('May', 'Mai');
    } else if (date.indexOf('June') > -1) {
      newDate = date.replace('June', 'Juin');
    } else if (date.indexOf('July') > -1) {
      newDate = date.replace('July', 'Juillet');
    } else if (date.indexOf('August') > -1) {
      newDate = date.replace('August', 'Août');
    } else if (date.indexOf('September') > -1) {
      newDate = date.replace('September', 'Septembre');
    } else if (date.indexOf('October') > -1) {
      newDate = date.replace('October', 'Octobre');
    } else if (date.indexOf('November') > -1) {
      newDate = date.replace('November', 'Novembre');
    } else if (date.indexOf('December') > -1) {
      newDate = date.replace('December', 'Décembre');
    }

    return newDate;
  }

  static isSeen(restaurantId, userId) {
    var notifs = this.getState().notifs;
    var index = _.findIndex(notifs, {'restaurant_id': restaurantId, 'user_id': userId});
    return notifs[index] && notifs[index].seen;
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }

  static nbUnseenNotifs() {
    return _.reduce(this.getState().notifs, function(unseen, notif) {
      if (!notif.seen) {
        return unseen + 1;
      }
      return unseen;
    }, 0) + this.getState().status.notifsPush;
  }
}

export default alt.createStore(NotifsStore);
