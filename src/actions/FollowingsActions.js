'use strict';

import alt from '../alt';
import request from '../utils/api';

export class FollowingsActions {

  followExpert(expert_id) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/followerships')
        .query({
          following_id: expert_id
        })
        .end((err, result) => {
          console.log('follow expert');
          console.log(err);
          console.log(result);
          if (err) {
            return this.followExpertFailed(err);
          }

          this.followExpertSuccess(result);
        });
    }
  }

  followExpertFailed(err) {
    return err;
  }

  followExpertSuccess(result) {
    return result;
  }

  unfollowExpert(expert_id) {
    return (dispatch) => {
      dispatch();
    
      request('DELETE', '/api/v2/followerships/' + expert_id)
        .end((err, result) => {
          console.log('remove friendship');
          console.log(err);
          console.log(result);
          if (err) {
            return this.unfollowExpertFailed(err);
          }

          this.unfollowExpertSuccess(friendship_id);
        });
    }
  }

  unfollowExpertFailed(err) {
    return err;
  }

  unfollowExpertSuccess(result) {
    return result;
  }
}

export default alt.createActions(FollowingsActions);