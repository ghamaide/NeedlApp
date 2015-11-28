'use strict';

import alt from '../alt';
import request from '../utils/api';

export class NotifsActions {

  fetchNotifs() {
    //this.dispatch();

    request('GET', '/api/recommendations')
      .end((err, result) => {
        if (err) {
          return this.actions.notifsFetchFailed(err);
        }

        this.actions.notifsFetched(result);
      });
  }

  notifsFetched(notifs) {
    this.dispatch(notifs);
  }

  notifsFetchFailed(err) {
    this.dispatch(err);
  }

  notifsSeen() {
    this.dispatch();
  }
}

export default alt.createActions(NotifsActions);
