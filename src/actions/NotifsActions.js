'use strict';

import alt from '../alt';
import request from '../utils/api';

export class NotifsActions {

  fetchNotifs() {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/recommendations')
        .end((err, result) => {
          if (err) {
            return this.notifsFetchFailed(err);
          }

          this.notifsFetched(result);
        });
    }
  }

  notifsFetched(notifs) {
    return notifs;
  }

  notifsFetchFailed(err) {
    return err;
  }

  notifsSeen() {
    return function (dispatch) {
      dispatch();
    }
  }
}

export default alt.createActions(NotifsActions);
