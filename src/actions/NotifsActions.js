'use strict';

import alt from '../alt';
import request from '../utils/api';

export class NotifsActions {

  fetchNotifications() {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v3/activities')
        .end((err, result) => {
          if (err) {
            return this.fetchNotificationsFailed(err);
          }

          this.fetchNotificationsSuccess(result);
        });
    }
  }

  fetchNotificationsSuccess(notifs) {
    return notifs;
  }

  fetchNotificationsFailed(err) {
    return err;
  }

  notificationsSeen() {
    return function (dispatch) {
      dispatch();
    }
  }
}

export default alt.createActions(NotifsActions);
