'use strict';

import {PushNotificationIOS} from 'react-native';

import alt from '../alt';
import _ from 'lodash';

import NotifsActions from '../actions/NotifsActions';
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
      handleNotifsFetched: NotifsActions.NOTIFS_FETCHED,
      handleNotifsFetchFailed: NotifsActions.NOTIFS_FETCH_FAILED,

      setNotifsAsSeen: NotifsActions.NOTIFS_SEEN

// ================================================================================================

    });
  }

  handleFetchNotifs() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleNotifsFetched(notifs) {
    this.notifs = _.map(notifs, (notif) => {
      var oldNotif = _.findWhere(this.notifs, {'restaurant_id': notif.restaurant_id, 'user_id': notif.user_id});
      notif.seen = oldNotif && oldNotif.seen;

      if (notif.date.indexOf("January") > -1) {
        notif.date = notif.date.replace("January", "Janvier");
      } else if (notif.date.indexOf("February") > -1) {
        notif.date = notif.date.replace("February", "Février");
      } else if (notif.date.indexOf("March") > -1) {
        notif.date = notif.date.replace("March", "Mars");
      } else if (notif.date.indexOf("April") > -1) {
        notif.date = notif.date.replace("April", "Avril");
      } else if (notif.date.indexOf("May") > -1) {
        notif.date = notif.date.replace("May", "Mai");
      } else if (notif.date.indexOf("June") > -1) {
        notif.date = notif.date.replace("June", "Juin");
      } else if (notif.date.indexOf("July") > -1) {
        notif.date = notif.date.replace("July", "Juillet");
      } else if (notif.date.indexOf("August") > -1) {
        notif.date = notif.date.replace("August", "Août");
      } else if (notif.date.indexOf("September") > -1) {
        notif.date = notif.date.replace("September", "Septembre");
      } else if (notif.date.indexOf("October") > -1) {
        notif.date = notif.date.replace("October", "Octobre");
      } else if (notif.date.indexOf("November") > -1) {
        notif.date = notif.date.replace("November", "Novembre");
      } else if (notif.date.indexOf("December") > -1) {
        notif.date = notif.date.replace("December", "Décembre");
      }
      return notif;
    });
    // on est à jour
    this.status.notifsPush = 0;
    this.status.loading = false;
  }

  handleNotifsFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  setNotifsAsSeen() {
    this.notifs = _.map(this.notifs, (notif) => {
      notif.seen = true;
      return notif;
    });
  }

  static isSeen(restaurantId, userId) {
    var notif = _.findWhere(this.getState().notifs, {'restaurant_id': restaurantId, 'user_id': userId});
    return notif && notif.seen;
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
