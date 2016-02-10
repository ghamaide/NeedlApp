'use strict';

import alt from '../alt';
import RecoActions from '../actions/RecoActions';
import MeStore from './Me';
import RestaurantsStore from './Restaurants';

export class RecoStore {

  constructor() {
    this.restaurants = [];
    this.reco = {};

    this.saved = false;

    this.loading = false;
    this.error = {};

    this.bindListeners({
      handleFetchRestaurants: RecoActions.FETCH_RESTAURANTS,
      handleRestaurantsFetched: RecoActions.RESTAURANTS_FETCHED,
      handleRestaurantsFetchFailed: RecoActions.RESTAURANTS_FETCH_FAILED,

      handleSetReco: RecoActions.SET_RECO,

// ================================================================================================

      handleSaveRecoSuccess: RecoActions.SAVE_RECO_SUCCESS,
      handleSaveRecoFailed: RecoActions.SAVE_RECO_FAILED,

      handleGetReco: RecoActions.GET_RECO,
      handleGetRecoFailed: RecoActions.GET_RECO_FAILED,
      handleGetRecoSuccess: RecoActions.GET_RECO_SUCCESS
    });
  }

  handleFetchRestaurants() {
    this.restaurants = [];
    this.loading = true;
    delete this.error;
  }

  handleRestaurantsFetched(restaurants) {
    this.restaurants = restaurants;
    this.loading = false;
  }

  handleRestaurantsFetchFailed(err) {
    this.loading = false;
    this.error = err;
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

  handleSaveRecoSuccess() {
    this.waitFor(RestaurantsStore.dispatchToken);
    delete this.errSave;
    this.saved = true;
  }

  handleSaveRecoFailed(data) {
    this.errSave = data.err;
  }
}

export default alt.createStore(RecoStore);
