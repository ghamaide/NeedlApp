'use strict';

import alt from '../alt';

import RecoActions from '../actions/RecoActions';

export class RecoStore {

  constructor() {
    this.restaurants = [];
    this.reco = {};

    this.loading = false;
    this.error = {};

    this.bindListeners({
      handleFetchRestaurants: RecoActions.FETCH_RESTAURANTS,
      handleFetchRestaurantsSuccess: RecoActions.FETCH_RESTAURANTS_SUCCESS,
      handleFetchRestaurantsFailed: RecoActions.FETCH_RESTAURANTS_FAILED,

      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,
      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,

      handleSetReco: RecoActions.SET_RECO,
    });
  }

  handleFetchRestaurants() {
    this.restaurants = [];
    this.loading = true;
    delete this.error;
  }

  handleFetchRestaurantsSuccess(restaurants) {
    this.restaurants = restaurants;
    this.loading = false;
  }

  handleFetchRestaurantsFailed(err) {
    this.loading = false;
    this.error = err;
  }

  handleAddRecoSuccess(result) {
    this.reco.restaurant.id = result.restaurant.id;
  }

  handleAddWishSuccess(result) {
    this.reco.restaurant.id = result.restaurant.id;
  }

  handleSetReco(reco) {
    this.reco = reco;
  }

  static error() {
    return this.getState().error;
  }

  static loading() {
    return this.getState().loading;
  }

  static getReco() {
    return this.getState().reco;
  }

  static getQueryRestaurants() {
    return this.getState().restaurants;
  }
}

export default alt.createStore(RecoStore);
