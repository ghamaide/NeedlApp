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
          if (err) {
            return this.followExpertFailed(err);
          }
          this.followExpertSuccess({expert_id: expert_id, activities: result.activities, restaurants: result.restaurants});
        });
    }
  }

  followExpertFailed(err) {
    return err;
  }

  followExpertSuccess(result) {
    return result;
  }

  unfollowExpert(followership_id, callback) {
    return (dispatch) => {
      dispatch();
    
      request('DELETE', '/api/v2/followerships/' + followership_id)
        .end((err, result) => {

          if (err) {
            return this.unfollowExpertFailed(err);
          }
          callback();
          this.unfollowExpertSuccess({followership_id: followership_id, restaurants: result});
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