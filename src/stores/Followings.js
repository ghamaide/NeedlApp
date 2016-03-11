'use strict';

import _ from 'lodash';

import alt from '../alt';

import FollowingsActions from '../actions/FollowingsActions';

export class FollowingsStore {

  constructor() {
    this.loading = false;
    this.error = {};

    this.bindListeners({
      handleFollowExpert: FollowingsActions.FOLLOW_EXPERT,
      handleFollowExpertFailed: FollowingsActions.FOLLOW_EXPERT_FAILED,
      handleFollowExpertSuccess: FollowingsActions.FOLLOW_EXPERT_SUCCESS,

      handleUnfollowExpert: FollowingsActions.UNFOLLOW_EXPERT,
      handleUnfollowExpertFailed: FollowingsActions.UNFOLLOW_EXPERT_FAILED,
      handleUnfollowExpertSuccess: FollowingsActions.UNFOLLOW_EXPERT_SUCCESS,
    });
  }

  handleFollowExpert() {
    this.loading = true;
    delete this.error;
  }

  handleFollowExpertFailed(err) {
    this.loading = false;
    this.error = err;
  }

  handleFollowExpertSuccess(result) {
    this.loading = false;
  }

  handleUnfollowExpert() {
    this.loading = true;
    delete this.error;
  }

  handleUnfollowExpertFailed(err) {
    this.loading = false;
    this.error = err;
  }

  handleUnfollowExpertSuccess(result) {
    this.loading = false;
  }

  static error() {
    return this.getState().error;
  }

  static loading() {
    return this.getState().loading;
  }
}

export default alt.createStore(FollowingsStore);
