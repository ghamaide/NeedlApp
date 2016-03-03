'use strict';

import alt from '../alt';

import RecoActions from '../actions/RecoActions';

import MeStore from './Me';
import RestaurantsStore from './Restaurants';

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

      handleSetReco: RecoActions.SET_RECO,

      handleAddRecoFailed: RecoActions.ADD_RECO_FAILED,

// ================================================================================================

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

  handleSetReco(reco) {
    this.reco = reco;
  }

  handleAddRecoFailed(err) {
    this.error = err;
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

  handleGetReco(restaurantId) {
    this.loading = true;
    delete this.error;
  }

  handleGetRecoFailed(data) {
    this.loading = false;
    this.error = data.err;
  }

  handleGetRecoSuccess(reco) {
    this.reco = reco;
    this.loading = false;
  }
}

export default alt.createStore(RecoStore);
